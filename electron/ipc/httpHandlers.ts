import { ipcMain } from 'electron';
import { sendHttpRequest, RequestConfig, ResponseData } from '../utils/httpClient.js';

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
  
  console.error(`[${timestamp}] HTTP operation failed: ${operation}`);
  console.error(`Error: ${errorMessage}`);
  if (errorStack) {
    console.error(`Stack: ${errorStack}`);
  }
}

function validateRequestConfig(config: any): void {
  if (!config || typeof config !== 'object') {
    throw new AppError('INVALID_INPUT', '无效的请求配置');
  }
  
  if (!config.method || !['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'].includes(config.method)) {
    throw new AppError('INVALID_INPUT', '无效的 HTTP 方法');
  }
  
  if (!config.url || typeof config.url !== 'string' || config.url.trim().length === 0) {
    throw new AppError('INVALID_INPUT', 'URL 不能为空');
  }
  
  try {
    new URL(config.url);
  } catch {
    throw new AppError('INVALID_INPUT', 'URL 格式不正确');
  }
  
  if (config.headers && typeof config.headers !== 'object') {
    throw new AppError('INVALID_INPUT', '无效的 headers 格式');
  }
  
  if (config.body !== undefined && typeof config.body !== 'string') {
    throw new AppError('INVALID_INPUT', 'body 必须是字符串类型');
  }
  
  if (config.timeout !== undefined && (typeof config.timeout !== 'number' || config.timeout <= 0)) {
    throw new AppError('INVALID_INPUT', '无效的超时时间');
  }
}

export function registerHttpHandlers(): void {
  ipcMain.handle('http:send', async (_event, config: RequestConfig): Promise<ResponseData> => {
    try {
      validateRequestConfig(config);
      const response = await sendHttpRequest(config);
      return response;
    } catch (error) {
      logError('http:send', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      if (error instanceof Error) {
        if (error.message.includes('请求超时')) {
          throw new AppError('HTTP_TIMEOUT', error.message);
        }
        
        if (error.message.includes('网络错误') || error.message.includes('连接被拒绝')) {
          throw new AppError('HTTP_NETWORK_ERROR', error.message);
        }
        
        throw new AppError(
          'HTTP_REQUEST_FAILED',
          error.message,
          error.stack
        );
      }
      
      throw new AppError(
        'HTTP_UNKNOWN_ERROR',
        '发送请求时发生未知错误',
        String(error)
      );
    }
  });
}
