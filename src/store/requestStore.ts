import { create } from 'zustand';
import { ipcService } from '../services/ipcService';
import { initService } from '../services/initService';
import type { HttpMethod } from '../types';

interface FormDataItem {
  key: string;
  value: string;
  type: 'text' | 'file';
  enabled: boolean;
}

interface CurrentRequest {
  id?: number;
  groupId?: number;
  name: string;
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body?: string;
  bodyMode?: 'none' | 'form-data' | 'x-www-form-urlencoded' | 'raw';
  rawType?: 'text' | 'json' | 'xml' | 'html' | 'javascript';
  formData?: FormDataItem[];
}

interface RequestState {
  currentRequest: CurrentRequest;
  
  setMethod: (method: HttpMethod) => void;
  setUrl: (url: string) => void;
  addHeader: (key: string, value: string) => void;
  updateHeader: (oldKey: string, newKey: string, value: string) => void;
  deleteHeader: (key: string) => void;
  setBody: (body: string) => void;
  setBodyMode: (mode: 'none' | 'form-data' | 'x-www-form-urlencoded' | 'raw') => void;
  setRawType: (type: 'text' | 'json' | 'xml' | 'html' | 'javascript') => void;
  setFormData: (formData: FormDataItem[]) => void;
  saveRequest: (groupId: number) => Promise<void>;
  loadRequest: (requestId: number, groupId: number, name: string, method: HttpMethod, url: string, headers: Record<string, string>, body?: string, bodyMode?: 'none' | 'form-data' | 'x-www-form-urlencoded' | 'raw', rawType?: 'text' | 'json' | 'xml' | 'html' | 'javascript', formData?: FormDataItem[]) => void;
  resetRequest: () => void;
}

const initialRequest: CurrentRequest = {
  name: 'New Request',
  method: 'GET',
  url: '',
  headers: {},
  body: '',
  bodyMode: 'none',
  rawType: 'text',
  formData: [],
};

export const useRequestStore = create<RequestState>((set, get) => ({
  currentRequest: { ...initialRequest },

  setMethod: (method: HttpMethod) => {
    set((state) => ({
      currentRequest: {
        ...state.currentRequest,
        method,
      },
    }));
  },

  setUrl: (url: string) => {
    set((state) => ({
      currentRequest: {
        ...state.currentRequest,
        url,
      },
    }));
  },

  addHeader: (key: string, value: string) => {
    set((state) => ({
      currentRequest: {
        ...state.currentRequest,
        headers: {
          ...state.currentRequest.headers,
          [key]: value,
        },
      },
    }));
  },

  updateHeader: (oldKey: string, newKey: string, value: string) => {
    set((state) => {
      const headers = { ...state.currentRequest.headers };
      if (oldKey !== newKey) {
        delete headers[oldKey];
      }
      headers[newKey] = value;
      
      return {
        currentRequest: {
          ...state.currentRequest,
          headers,
        },
      };
    });
  },

  deleteHeader: (key: string) => {
    set((state) => {
      const headers = { ...state.currentRequest.headers };
      delete headers[key];
      
      return {
        currentRequest: {
          ...state.currentRequest,
          headers,
        },
      };
    });
  },

  setBody: (body: string) => {
    set((state) => ({
      currentRequest: {
        ...state.currentRequest,
        body,
      },
    }));
  },

  setBodyMode: (bodyMode: 'none' | 'form-data' | 'x-www-form-urlencoded' | 'raw') => {
    set((state) => ({
      currentRequest: {
        ...state.currentRequest,
        bodyMode,
      },
    }));
  },

  setRawType: (rawType: 'text' | 'json' | 'xml' | 'html' | 'javascript') => {
    set((state) => ({
      currentRequest: {
        ...state.currentRequest,
        rawType,
      },
    }));
  },

  setFormData: (formData: FormDataItem[]) => {
    set((state) => ({
      currentRequest: {
        ...state.currentRequest,
        formData,
      },
    }));
  },

  saveRequest: async (groupId: number) => {
    const { currentRequest } = get();
    
    try {
      if (currentRequest.id) {
        await ipcService.updateRequest(currentRequest.id, {
          name: currentRequest.name,
          method: currentRequest.method,
          url: currentRequest.url,
          headers: currentRequest.headers,
          body: currentRequest.body,
          bodyMode: currentRequest.bodyMode,
          rawType: currentRequest.rawType,
          formData: currentRequest.formData,
        });
      } else {
        const newRequest = await ipcService.createRequest({
          groupId,
          name: currentRequest.name,
          method: currentRequest.method,
          url: currentRequest.url,
          headers: currentRequest.headers,
          body: currentRequest.body,
          bodyMode: currentRequest.bodyMode,
          rawType: currentRequest.rawType,
          formData: currentRequest.formData,
        });
        
        set((state) => ({
          currentRequest: {
            ...state.currentRequest,
            id: newRequest.id,
            groupId: newRequest.groupId,
          },
        }));
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to save request:', error);
      throw error;
    }
  },

  loadRequest: (
    requestId: number,
    groupId: number,
    name: string,
    method: HttpMethod,
    url: string,
    headers: Record<string, string>,
    body?: string,
    bodyMode?: 'none' | 'form-data' | 'x-www-form-urlencoded' | 'raw',
    rawType?: 'text' | 'json' | 'xml' | 'html' | 'javascript',
    formData?: FormDataItem[]
  ) => {
    set({
      currentRequest: {
        id: requestId,
        groupId,
        name,
        method,
        url,
        headers,
        body,
        bodyMode: bodyMode || 'none',
        rawType: rawType || 'text',
        formData: formData || [],
      },
    });
    
    initService.saveLastRequest(requestId);
  },

  resetRequest: () => {
    set({
      currentRequest: { ...initialRequest },
    });
  },
}));
