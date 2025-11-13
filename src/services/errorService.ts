import { toast } from 'sonner';
import { IPCError } from './ipcService';

export class ErrorService {
  private errorLog: Array<{
    timestamp: string;
    type: string;
    message: string;
    stack?: string;
  }> = [];

  initialize() {
    window.addEventListener('error', this.handleWindowError);
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  cleanup() {
    window.removeEventListener('error', this.handleWindowError);
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  private handleWindowError = (event: ErrorEvent) => {
    console.error('Window error:', event.error);
    
    this.logError('WindowError', event.error || new Error(event.message));
    
    toast.error('发生错误', {
      description: event.message,
      duration: 4000,
    });
  };

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason));
    
    this.logError('UnhandledRejection', error);
    
    if (event.reason instanceof IPCError) {
      toast.error('IPC 调用失败', {
        description: event.reason.message,
        duration: 4000,
      });
    } else {
      toast.error('操作失败', {
        description: error.message,
        duration: 4000,
      });
    }
  };

  private logError(type: string, error: Error) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type,
      message: error.message,
      stack: error.stack,
    };

    this.errorLog.push(logEntry);
    
    if (this.errorLog.length > 100) {
      this.errorLog.shift();
    }

    console.error(`[${type}]`, logEntry);
  }

  handleError(error: unknown, context?: string) {
    const err = error instanceof Error ? error : new Error(String(error));
    
    console.error(`Error in ${context || 'unknown context'}:`, err);
    
    this.logError(context || 'ManualError', err);
    
    toast.error(context ? `${context}失败` : '操作失败', {
      description: err.message,
      duration: 4000,
    });
  }

  showSuccess(message: string, description?: string) {
    toast.success(message, {
      description,
      duration: 3000,
    });
  }

  showInfo(message: string, description?: string) {
    toast.info(message, {
      description,
      duration: 3000,
    });
  }

  showWarning(message: string, description?: string) {
    toast.warning(message, {
      description,
      duration: 3000,
    });
  }

  getErrorLog() {
    return [...this.errorLog];
  }

  clearErrorLog() {
    this.errorLog = [];
  }
}

export const errorService = new ErrorService();
