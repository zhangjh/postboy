import React, { Component, ReactNode } from 'react';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.logErrorToFile(error, errorInfo);
    
    toast.error('应用程序发生错误', {
      description: error.message,
      duration: 5000,
    });
  }

  private logErrorToFile(error: Error, errorInfo: React.ErrorInfo) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    };

    console.error('Error log:', JSON.stringify(errorLog, null, 2));
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex items-center justify-center bg-background p-8">
          <div className="max-w-2xl w-full bg-card border border-border rounded-lg p-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-destructive mb-2">出错了</h1>
              <p className="text-muted-foreground">应用程序遇到了一个意外错误</p>
            </div>

            {this.state.error && (
              <div className="bg-muted rounded-md p-4 mb-6">
                <p className="text-sm font-mono text-foreground mb-2">
                  {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <details className="mt-2">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                      查看详细信息
                    </summary>
                    <pre className="text-xs mt-2 overflow-auto max-h-64 text-muted-foreground">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                重试
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
              >
                重新加载应用
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
