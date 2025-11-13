import { create } from 'zustand';
import { ipcService } from '../services/ipcService';
import { errorService } from '../services/errorService';
import type { ResponseData, RequestConfig } from '../types';

interface ResponseState {
  responseData: ResponseData | null;
  isLoading: boolean;
  error: string | null;
  
  sendRequest: (config: RequestConfig) => Promise<void>;
  clearResponse: () => void;
}

export const useResponseStore = create<ResponseState>((set) => ({
  responseData: null,
  isLoading: false,
  error: null,

  sendRequest: async (config: RequestConfig) => {
    set({ isLoading: true, error: null, responseData: null });
    
    try {
      const response = await ipcService.sendHttpRequest(config);
      set({
        responseData: response,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Request failed';
      set({
        responseData: null,
        isLoading: false,
        error: errorMessage,
      });
      errorService.handleError(error, '发送请求');
      throw error;
    }
  },

  clearResponse: () => {
    set({
      responseData: null,
      isLoading: false,
      error: null,
    });
  },
}));
