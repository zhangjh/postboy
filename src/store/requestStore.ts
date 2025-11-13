import { create } from 'zustand';
import { ipcService } from '../services/ipcService';
import { initService } from '../services/initService';
import type { HttpMethod } from '../types';

interface CurrentRequest {
  id?: number;
  groupId?: number;
  name: string;
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body?: string;
  bodyType?: 'text' | 'json' | 'xml';
}

interface RequestState {
  currentRequest: CurrentRequest;
  
  setMethod: (method: HttpMethod) => void;
  setUrl: (url: string) => void;
  addHeader: (key: string, value: string) => void;
  updateHeader: (oldKey: string, newKey: string, value: string) => void;
  deleteHeader: (key: string) => void;
  setBody: (body: string) => void;
  setBodyType: (bodyType: 'text' | 'json' | 'xml') => void;
  saveRequest: (groupId: number) => Promise<void>;
  loadRequest: (requestId: number, groupId: number, name: string, method: HttpMethod, url: string, headers: Record<string, string>, body?: string, bodyType?: 'text' | 'json' | 'xml') => void;
  resetRequest: () => void;
}

const initialRequest: CurrentRequest = {
  name: 'New Request',
  method: 'GET',
  url: '',
  headers: {},
  body: '',
  bodyType: 'text',
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

  setBodyType: (bodyType: 'text' | 'json' | 'xml') => {
    set((state) => ({
      currentRequest: {
        ...state.currentRequest,
        bodyType,
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
          bodyType: currentRequest.bodyType,
        });
      } else {
        const newRequest = await ipcService.createRequest({
          groupId,
          name: currentRequest.name,
          method: currentRequest.method,
          url: currentRequest.url,
          headers: currentRequest.headers,
          body: currentRequest.body,
          bodyType: currentRequest.bodyType,
        });
        
        set((state) => ({
          currentRequest: {
            ...state.currentRequest,
            id: newRequest.id,
            groupId: newRequest.groupId,
          },
        }));
      }
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
    bodyType?: 'text' | 'json' | 'xml'
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
        bodyType,
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
