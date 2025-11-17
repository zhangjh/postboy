import { HttpMethod } from '../database/requestItem';

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

function parseResponseHeaders(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

function calculateResponseSize(data: any, headers: Record<string, string>): number {
  const contentLength = headers['content-length'];
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    if (!isNaN(size)) {
      return size;
    }
  }
  
  if (typeof data === 'string') {
    return new Blob([data]).size;
  }
  
  if (data instanceof ArrayBuffer) {
    return data.byteLength;
  }
  
  if (data && typeof data === 'object') {
    return new Blob([JSON.stringify(data)]).size;
  }
  
  return 0;
}

async function parseResponseBody(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type') || '';
  
  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return await response.text();
    }
  }
  
  if (contentType.includes('text/') || 
      contentType.includes('application/xml') ||
      contentType.includes('application/javascript')) {
    return await response.text();
  }
  
  if (contentType.includes('image/') || 
      contentType.includes('application/octet-stream') ||
      contentType.includes('application/pdf')) {
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    return {
      type: 'binary',
      contentType,
      data: base64,
    };
  }
  
  try {
    return await response.text();
  } catch {
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    return {
      type: 'binary',
      contentType,
      data: base64,
    };
  }
}

export async function sendHttpRequest(config: RequestConfig): Promise<ResponseData> {
  const timeout = config.timeout || 30000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  const startTime = Date.now();
  
  try {
    let url = config.url.trim();
    if (url && !url.match(/^https?:\/\//i)) {
      url = 'http://' + url;
    }
    
    const fetchOptions: RequestInit = {
      method: config.method,
      headers: config.headers,
      signal: controller.signal,
    };
    
    if (config.body && ['POST', 'PUT', 'DELETE'].includes(config.method)) {
      fetchOptions.body = config.body;
    }
    
    const response = await fetch(url, fetchOptions);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const responseHeaders = parseResponseHeaders(response.headers);
    const data = await parseResponseBody(response);
    const size = calculateResponseSize(data, responseHeaders);
    
    return {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      data,
      duration,
      size,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(`请求超时 (${timeout}ms)`);
      }
      
      if (error.message.includes('fetch failed') || error.message.includes('ENOTFOUND')) {
        throw new Error(`网络错误: 无法连接到 ${config.url}`);
      }
      
      if (error.message.includes('ECONNREFUSED')) {
        throw new Error(`连接被拒绝: ${config.url}`);
      }
      
      throw new Error(`请求失败: ${error.message}`);
    }
    
    throw new Error('未知错误');
  } finally {
    clearTimeout(timeoutId);
  }
}
