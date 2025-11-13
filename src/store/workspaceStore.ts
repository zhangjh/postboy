import { create } from 'zustand';
import { ipcService } from '../services/ipcService';
import { initService } from '../services/initService';
import { errorService } from '../services/errorService';
import type { Workspace, RequestGroup, RequestItem } from '../types';

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspaceId: number | null;
  groups: RequestGroup[];
  requests: RequestItem[];
  
  loadWorkspaces: () => Promise<void>;
  selectWorkspace: (workspaceId: number) => Promise<void>;
  createWorkspace: (name: string) => Promise<Workspace>;
  deleteWorkspace: (workspaceId: number) => Promise<void>;
  
  createGroup: (workspaceId: number, name: string) => Promise<RequestGroup>;
  updateGroup: (groupId: number, name: string) => Promise<void>;
  deleteGroup: (groupId: number) => Promise<void>;
  
  createRequest: (groupId: number, data: Partial<RequestItem>) => Promise<RequestItem>;
  updateRequest: (requestId: number, data: Partial<RequestItem>) => Promise<void>;
  deleteRequest: (requestId: number) => Promise<void>;
  
  exportConfig: () => Promise<void>;
  importConfig: () => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaces: [],
  currentWorkspaceId: null,
  groups: [],
  requests: [],

  loadWorkspaces: async () => {
    try {
      const workspaces = await ipcService.getWorkspaces();
      set({ workspaces });
    } catch (error) {
      console.error('Failed to load workspaces:', error);
      throw error;
    }
  },

  selectWorkspace: async (workspaceId: number) => {
    try {
      const groups = await ipcService.getGroups(workspaceId);
      
      const allRequests: RequestItem[] = [];
      for (const group of groups) {
        const requests = await ipcService.getRequests(group.id);
        allRequests.push(...requests);
      }
      
      set({
        currentWorkspaceId: workspaceId,
        groups,
        requests: allRequests,
      });
      
      initService.saveLastWorkspace(workspaceId);
    } catch (error) {
      console.error('Failed to select workspace:', error);
      throw error;
    }
  },

  createWorkspace: async (name: string) => {
    try {
      const workspace = await ipcService.createWorkspace(name);
      set((state) => ({
        workspaces: [...state.workspaces, workspace],
      }));
      errorService.showSuccess('创建成功', `工作区 "${name}" 已创建`);
      return workspace;
    } catch (error) {
      errorService.handleError(error, '创建工作区');
      throw error;
    }
  },

  deleteWorkspace: async (workspaceId: number) => {
    try {
      await ipcService.deleteWorkspace(workspaceId);
      set((state) => ({
        workspaces: state.workspaces.filter((w) => w.id !== workspaceId),
        currentWorkspaceId: state.currentWorkspaceId === workspaceId ? null : state.currentWorkspaceId,
        groups: state.currentWorkspaceId === workspaceId ? [] : state.groups,
        requests: state.currentWorkspaceId === workspaceId ? [] : state.requests,
      }));
      errorService.showSuccess('删除成功', '工作区已删除');
    } catch (error) {
      errorService.handleError(error, '删除工作区');
      throw error;
    }
  },

  createGroup: async (workspaceId: number, name: string) => {
    try {
      const group = await ipcService.createGroup(workspaceId, name);
      set((state) => ({
        groups: [...state.groups, group],
      }));
      errorService.showSuccess('创建成功', `分组 "${name}" 已创建`);
      return group;
    } catch (error) {
      errorService.handleError(error, '创建分组');
      throw error;
    }
  },

  updateGroup: async (groupId: number, name: string) => {
    try {
      await ipcService.updateGroup(groupId, name);
      set((state) => ({
        groups: state.groups.map((g) => (g.id === groupId ? { ...g, name } : g)),
      }));
      errorService.showSuccess('更新成功', '分组名称已更新');
    } catch (error) {
      errorService.handleError(error, '更新分组');
      throw error;
    }
  },

  deleteGroup: async (groupId: number) => {
    try {
      await ipcService.deleteGroup(groupId);
      set((state) => ({
        groups: state.groups.filter((g) => g.id !== groupId),
        requests: state.requests.filter((r) => r.groupId !== groupId),
      }));
      errorService.showSuccess('删除成功', '分组已删除');
    } catch (error) {
      errorService.handleError(error, '删除分组');
      throw error;
    }
  },

  createRequest: async (groupId: number, data: Partial<RequestItem>) => {
    try {
      const request = await ipcService.createRequest({ groupId, ...data });
      set((state) => ({
        requests: [...state.requests, request],
      }));
      errorService.showSuccess('创建成功', '请求已创建');
      return request;
    } catch (error) {
      errorService.handleError(error, '创建请求');
      throw error;
    }
  },

  updateRequest: async (requestId: number, data: Partial<RequestItem>) => {
    try {
      await ipcService.updateRequest(requestId, data);
      set((state) => ({
        requests: state.requests.map((r) => (r.id === requestId ? { ...r, ...data } : r)),
      }));
    } catch (error) {
      errorService.handleError(error, '更新请求');
      throw error;
    }
  },

  deleteRequest: async (requestId: number) => {
    try {
      await ipcService.deleteRequest(requestId);
      set((state) => ({
        requests: state.requests.filter((r) => r.id !== requestId),
      }));
      errorService.showSuccess('删除成功', '请求已删除');
    } catch (error) {
      errorService.handleError(error, '删除请求');
      throw error;
    }
  },

  exportConfig: async () => {
    try {
      await ipcService.exportConfig();
      errorService.showSuccess('导出成功', '配置已导出');
    } catch (error) {
      errorService.handleError(error, '导出配置');
      throw error;
    }
  },

  importConfig: async () => {
    try {
      await ipcService.importConfig();
      const workspaces = await ipcService.getWorkspaces();
      set({
        workspaces,
        currentWorkspaceId: null,
        groups: [],
        requests: [],
      });
      errorService.showSuccess('导入成功', '配置已导入');
    } catch (error) {
      errorService.handleError(error, '导入配置');
      throw error;
    }
  },
}));
