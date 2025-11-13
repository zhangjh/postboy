import type {
  Workspace,
  RequestGroup,
  RequestItem,
  RequestConfig,
  ResponseData,
  ExportData,
} from '../types';

class IPCError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'IPCError';
  }
}

class IPCService {
  private async invoke<T>(channel: string, ...args: any[]): Promise<T> {
    try {
      return await window.electron.invoke(channel, ...args);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'IPC call failed';
      throw new IPCError('IPC_CALL_FAILED', errorMessage, { channel, args, error });
    }
  }

  async getWorkspaces(): Promise<Workspace[]> {
    return this.invoke<Workspace[]>('db:getWorkspaces');
  }

  async createWorkspace(name: string): Promise<Workspace> {
    return this.invoke<Workspace>('db:createWorkspace', name);
  }

  async updateWorkspace(id: number, name: string): Promise<void> {
    return this.invoke<void>('db:updateWorkspace', id, name);
  }

  async deleteWorkspace(id: number): Promise<void> {
    return this.invoke<void>('db:deleteWorkspace', id);
  }

  async getGroups(workspaceId: number): Promise<RequestGroup[]> {
    return this.invoke<RequestGroup[]>('db:getGroups', workspaceId);
  }

  async createGroup(workspaceId: number, name: string): Promise<RequestGroup> {
    return this.invoke<RequestGroup>('db:createGroup', workspaceId, name);
  }

  async updateGroup(id: number, name: string): Promise<void> {
    return this.invoke<void>('db:updateGroup', id, name);
  }

  async deleteGroup(id: number): Promise<void> {
    return this.invoke<void>('db:deleteGroup', id);
  }

  async getRequests(groupId: number): Promise<RequestItem[]> {
    return this.invoke<RequestItem[]>('db:getRequests', groupId);
  }

  async createRequest(data: Partial<RequestItem> & { groupId: number }): Promise<RequestItem> {
    return this.invoke<RequestItem>('db:createRequest', data);
  }

  async updateRequest(id: number, data: Partial<RequestItem>): Promise<void> {
    return this.invoke<void>('db:updateRequest', id, data);
  }

  async deleteRequest(id: number): Promise<void> {
    return this.invoke<void>('db:deleteRequest', id);
  }

  async sendHttpRequest(config: RequestConfig): Promise<ResponseData> {
    return this.invoke<ResponseData>('http:send', config);
  }

  async exportConfig(): Promise<string> {
    return this.invoke<string>('file:export');
  }

  async importConfig(): Promise<ExportData> {
    return this.invoke<ExportData>('file:import');
  }
}

export const ipcService = new IPCService();
export { IPCError };
