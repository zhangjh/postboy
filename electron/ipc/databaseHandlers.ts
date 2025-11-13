import { ipcMain } from 'electron';
import {
  getWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
} from '../database/workspace.js';
import {
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
} from '../database/requestGroup.js';
import {
  getRequests,
  createRequest,
  updateRequest,
  deleteRequest,
  CreateRequestItemData,
  UpdateRequestItemData,
} from '../database/requestItem.js';

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
  
  console.error(`[${timestamp}] Database operation failed: ${operation}`);
  console.error(`Error: ${errorMessage}`);
  if (errorStack) {
    console.error(`Stack: ${errorStack}`);
  }
}

export function registerDatabaseHandlers(): void {
  ipcMain.handle('db:getWorkspaces', async () => {
    try {
      return getWorkspaces();
    } catch (error) {
      logError('db:getWorkspaces', error);
      throw new AppError(
        'DB_GET_WORKSPACES_FAILED',
        '获取工作空间列表失败',
        error instanceof Error ? error.message : String(error)
      );
    }
  });

  ipcMain.handle('db:createWorkspace', async (_event, name: string) => {
    try {
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        throw new AppError('INVALID_INPUT', '工作空间名称不能为空');
      }
      return createWorkspace(name.trim());
    } catch (error) {
      logError('db:createWorkspace', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        'DB_CREATE_WORKSPACE_FAILED',
        '创建工作空间失败',
        error instanceof Error ? error.message : String(error)
      );
    }
  });

  ipcMain.handle('db:updateWorkspace', async (_event, id: number, name: string) => {
    try {
      if (typeof id !== 'number' || id <= 0) {
        throw new AppError('INVALID_INPUT', '无效的工作空间 ID');
      }
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        throw new AppError('INVALID_INPUT', '工作空间名称不能为空');
      }
      updateWorkspace(id, name.trim());
    } catch (error) {
      logError('db:updateWorkspace', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        'DB_UPDATE_WORKSPACE_FAILED',
        '更新工作空间失败',
        error instanceof Error ? error.message : String(error)
      );
    }
  });

  ipcMain.handle('db:deleteWorkspace', async (_event, id: number) => {
    try {
      if (typeof id !== 'number' || id <= 0) {
        throw new AppError('INVALID_INPUT', '无效的工作空间 ID');
      }
      deleteWorkspace(id);
    } catch (error) {
      logError('db:deleteWorkspace', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        'DB_DELETE_WORKSPACE_FAILED',
        '删除工作空间失败',
        error instanceof Error ? error.message : String(error)
      );
    }
  });

  ipcMain.handle('db:getGroups', async (_event, workspaceId: number) => {
    try {
      if (typeof workspaceId !== 'number' || workspaceId <= 0) {
        throw new AppError('INVALID_INPUT', '无效的工作空间 ID');
      }
      return getGroups(workspaceId);
    } catch (error) {
      logError('db:getGroups', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        'DB_GET_GROUPS_FAILED',
        '获取分组列表失败',
        error instanceof Error ? error.message : String(error)
      );
    }
  });

  ipcMain.handle('db:createGroup', async (_event, workspaceId: number, name: string, sortOrder?: number) => {
    try {
      if (typeof workspaceId !== 'number' || workspaceId <= 0) {
        throw new AppError('INVALID_INPUT', '无效的工作空间 ID');
      }
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        throw new AppError('INVALID_INPUT', '分组名称不能为空');
      }
      if (sortOrder !== undefined && (typeof sortOrder !== 'number' || sortOrder < 0)) {
        throw new AppError('INVALID_INPUT', '无效的排序值');
      }
      return createGroup(workspaceId, name.trim(), sortOrder);
    } catch (error) {
      logError('db:createGroup', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        'DB_CREATE_GROUP_FAILED',
        '创建分组失败',
        error instanceof Error ? error.message : String(error)
      );
    }
  });

  ipcMain.handle('db:updateGroup', async (_event, id: number, name: string, sortOrder?: number) => {
    try {
      if (typeof id !== 'number' || id <= 0) {
        throw new AppError('INVALID_INPUT', '无效的分组 ID');
      }
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        throw new AppError('INVALID_INPUT', '分组名称不能为空');
      }
      if (sortOrder !== undefined && (typeof sortOrder !== 'number' || sortOrder < 0)) {
        throw new AppError('INVALID_INPUT', '无效的排序值');
      }
      updateGroup(id, name.trim(), sortOrder);
    } catch (error) {
      logError('db:updateGroup', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        'DB_UPDATE_GROUP_FAILED',
        '更新分组失败',
        error instanceof Error ? error.message : String(error)
      );
    }
  });

  ipcMain.handle('db:deleteGroup', async (_event, id: number) => {
    try {
      if (typeof id !== 'number' || id <= 0) {
        throw new AppError('INVALID_INPUT', '无效的分组 ID');
      }
      deleteGroup(id);
    } catch (error) {
      logError('db:deleteGroup', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        'DB_DELETE_GROUP_FAILED',
        '删除分组失败',
        error instanceof Error ? error.message : String(error)
      );
    }
  });

  ipcMain.handle('db:getRequests', async (_event, groupId: number) => {
    try {
      if (typeof groupId !== 'number' || groupId <= 0) {
        throw new AppError('INVALID_INPUT', '无效的分组 ID');
      }
      return getRequests(groupId);
    } catch (error) {
      logError('db:getRequests', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        'DB_GET_REQUESTS_FAILED',
        '获取请求列表失败',
        error instanceof Error ? error.message : String(error)
      );
    }
  });

  ipcMain.handle('db:createRequest', async (_event, data: CreateRequestItemData) => {
    try {
      if (!data || typeof data !== 'object') {
        throw new AppError('INVALID_INPUT', '无效的请求数据');
      }
      if (typeof data.groupId !== 'number' || data.groupId <= 0) {
        throw new AppError('INVALID_INPUT', '无效的分组 ID');
      }
      if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
        throw new AppError('INVALID_INPUT', '请求名称不能为空');
      }
      if (!data.method || !['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'].includes(data.method)) {
        throw new AppError('INVALID_INPUT', '无效的 HTTP 方法');
      }
      if (!data.url || typeof data.url !== 'string' || data.url.trim().length === 0) {
        throw new AppError('INVALID_INPUT', 'URL 不能为空');
      }
      
      return createRequest({
        ...data,
        name: data.name.trim(),
        url: data.url.trim(),
      });
    } catch (error) {
      logError('db:createRequest', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        'DB_CREATE_REQUEST_FAILED',
        '创建请求失败',
        error instanceof Error ? error.message : String(error)
      );
    }
  });

  ipcMain.handle('db:updateRequest', async (_event, id: number, data: UpdateRequestItemData) => {
    try {
      if (typeof id !== 'number' || id <= 0) {
        throw new AppError('INVALID_INPUT', '无效的请求 ID');
      }
      if (!data || typeof data !== 'object') {
        throw new AppError('INVALID_INPUT', '无效的请求数据');
      }
      if (data.name !== undefined && (typeof data.name !== 'string' || data.name.trim().length === 0)) {
        throw new AppError('INVALID_INPUT', '请求名称不能为空');
      }
      if (data.method !== undefined && !['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'].includes(data.method)) {
        throw new AppError('INVALID_INPUT', '无效的 HTTP 方法');
      }
      if (data.url !== undefined && (typeof data.url !== 'string' || data.url.trim().length === 0)) {
        throw new AppError('INVALID_INPUT', 'URL 不能为空');
      }
      
      const sanitizedData: UpdateRequestItemData = { ...data };
      if (data.name) sanitizedData.name = data.name.trim();
      if (data.url) sanitizedData.url = data.url.trim();
      
      updateRequest(id, sanitizedData);
    } catch (error) {
      logError('db:updateRequest', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        'DB_UPDATE_REQUEST_FAILED',
        '更新请求失败',
        error instanceof Error ? error.message : String(error)
      );
    }
  });

  ipcMain.handle('db:deleteRequest', async (_event, id: number) => {
    try {
      if (typeof id !== 'number' || id <= 0) {
        throw new AppError('INVALID_INPUT', '无效的请求 ID');
      }
      deleteRequest(id);
    } catch (error) {
      logError('db:deleteRequest', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        'DB_DELETE_REQUEST_FAILED',
        '删除请求失败',
        error instanceof Error ? error.message : String(error)
      );
    }
  });
}
