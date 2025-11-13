export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD';

export interface Workspace {
  id: number;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface RequestGroup {
  id: number;
  workspaceId: number;
  name: string;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

export interface RequestItem {
  id: number;
  groupId: number;
  name: string;
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body?: string;
  bodyType?: 'text' | 'json' | 'xml';
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

export interface RequestConfig {
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body?: string;
  timeout?: number;
}

export interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  duration: number;
  size: number;
}

export interface ExportData {
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
