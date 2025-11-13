import { ipcMain, dialog } from 'electron';
import fs from 'fs/promises';
import { getWorkspaces } from '../database/workspace.js';
import { getGroups } from '../database/requestGroup.js';
import { getRequests } from '../database/requestItem.js';
import type { Workspace } from '../database/workspace.js';
import type { RequestGroup } from '../database/requestGroup.js';
import type { RequestItem } from '../database/requestItem.js';

interface ExportData {
  version: string;
  exportedAt: number;
  workspaces: Array<{
    workspace: Workspace;
    groups: Array<{
      group: RequestGroup;
      requests: RequestItem[];
    }>;
  }>;
}

class AppError extends Error {
  code: string;
  details?: any;
  
  constructor(code: string, message: string, details?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }
}

function logError(operation: string, error: unknown): void {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : '';
  
  console.error(`[${timestamp}] File operation failed: ${operation}`);
  console.error(`Error: ${errorMessage}`);
  if (errorStack) {
    console.error(`Stack: ${errorStack}`);
  }
}

async function buildExportData(): Promise<ExportData> {
  const workspaces = getWorkspaces();
  
  const exportData: ExportData = {
    version: '1.0.0',
    exportedAt: Date.now(),
    workspaces: [],
  };
  
  for (const workspace of workspaces) {
    const groups = getGroups(workspace.id);
    const workspaceData = {
      workspace,
      groups: [] as Array<{
        group: RequestGroup;
        requests: RequestItem[];
      }>,
    };
    
    for (const group of groups) {
      const requests = getRequests(group.id);
      workspaceData.groups.push({
        group,
        requests,
      });
    }
    
    exportData.workspaces.push(workspaceData);
  }
  
  return exportData;
}

function validateExportData(data: any): void {
  if (!data || typeof data !== 'object') {
    throw new AppError('INVALID_FORMAT', '配置文件格式不正确');
  }
  
  if (!data.version || typeof data.version !== 'string') {
    throw new AppError('INVALID_FORMAT', '配置文件缺少版本信息');
  }
  
  if (!Array.isArray(data.workspaces)) {
    throw new AppError('INVALID_FORMAT', '配置文件缺少工作空间数据');
  }
  
  for (const ws of data.workspaces) {
    if (!ws.workspace || typeof ws.workspace !== 'object') {
      throw new AppError('INVALID_FORMAT', '工作空间数据格式不正确');
    }
    
    if (!ws.workspace.name || typeof ws.workspace.name !== 'string') {
      throw new AppError('INVALID_FORMAT', '工作空间名称不正确');
    }
    
    if (!Array.isArray(ws.groups)) {
      throw new AppError('INVALID_FORMAT', '分组数据格式不正确');
    }
    
    for (const grp of ws.groups) {
      if (!grp.group || typeof grp.group !== 'object') {
        throw new AppError('INVALID_FORMAT', '分组数据格式不正确');
      }
      
      if (!grp.group.name || typeof grp.group.name !== 'string') {
        throw new AppError('INVALID_FORMAT', '分组名称不正确');
      }
      
      if (!Array.isArray(grp.requests)) {
        throw new AppError('INVALID_FORMAT', '请求数据格式不正确');
      }
      
      for (const req of grp.requests) {
        if (!req.name || !req.method || !req.url) {
          throw new AppError('INVALID_FORMAT', '请求数据不完整');
        }
        
        if (!['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'].includes(req.method)) {
          throw new AppError('INVALID_FORMAT', `无效的 HTTP 方法: ${req.method}`);
        }
      }
    }
  }
}

async function importData(data: ExportData): Promise<void> {
  const { getDatabase } = await import('../database/connection');
  const db = getDatabase();
  
  const transaction = db.transaction(() => {
    db.prepare('DELETE FROM request_items').run();
    db.prepare('DELETE FROM request_groups').run();
    db.prepare('DELETE FROM workspaces').run();
    
    const insertWorkspace = db.prepare(
      'INSERT INTO workspaces (name, created_at, updated_at) VALUES (?, ?, ?)'
    );
    const insertGroup = db.prepare(
      'INSERT INTO request_groups (workspace_id, name, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
    );
    const insertRequest = db.prepare(`
      INSERT INTO request_items 
      (group_id, name, method, url, headers, body, body_type, sort_order, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const wsData of data.workspaces) {
      const ws = wsData.workspace;
      const wsResult = insertWorkspace.run(ws.name, ws.createdAt, ws.updatedAt);
      const newWorkspaceId = wsResult.lastInsertRowid as number;
      
      for (const grpData of wsData.groups) {
        const grp = grpData.group;
        const grpResult = insertGroup.run(
          newWorkspaceId,
          grp.name,
          grp.sortOrder,
          grp.createdAt,
          grp.updatedAt
        );
        const newGroupId = grpResult.lastInsertRowid as number;
        
        for (const req of grpData.requests) {
          const headersJson = req.headers ? JSON.stringify(req.headers) : null;
          insertRequest.run(
            newGroupId,
            req.name,
            req.method,
            req.url,
            headersJson,
            req.body ?? null,
            req.bodyType ?? null,
            req.sortOrder,
            req.createdAt,
            req.updatedAt
          );
        }
      }
    }
  });
  
  transaction();
}

export function registerFileHandlers(): void {
  ipcMain.handle('file:export', async () => {
    try {
      const result = await dialog.showSaveDialog({
        title: '导出配置',
        defaultPath: `postboy-config-${Date.now()}.json`,
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      });
      
      if (result.canceled || !result.filePath) {
        return null;
      }
      
      const exportData = await buildExportData();
      const jsonContent = JSON.stringify(exportData, null, 2);
      await fs.writeFile(result.filePath, jsonContent, 'utf-8');
      return result.filePath;
    } catch (error) {
      logError('file:export', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(
        'FILE_EXPORT_FAILED',
        '导出配置失败',
        error instanceof Error ? error.message : String(error)
      );
    }
  });
  
  ipcMain.handle('file:import', async () => {
    try {
      const result = await dialog.showOpenDialog({
        title: '导入配置',
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] },
        ],
        properties: ['openFile'],
      });
      
      if (result.canceled || result.filePaths.length === 0) {
        return null;
      }
      
      const filePath = result.filePaths[0];
      const fileContent = await fs.readFile(filePath, 'utf-8');
      
      let data: any;
      try {
        data = JSON.parse(fileContent);
      } catch (error) {
        throw new AppError('INVALID_FORMAT', 'JSON 文件格式不正确');
      }
      
      validateExportData(data);
      await importData(data as ExportData);
      return true;
    } catch (error) {
      logError('file:import', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(
        'FILE_IMPORT_FAILED',
        '导入配置失败',
        error instanceof Error ? error.message : String(error)
      );
    }
  });
}
