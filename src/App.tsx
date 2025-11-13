import { useEffect, useState } from 'react';
import { MainLayout } from './components/Layout/MainLayout';
import { Sidebar } from './components/Workspace/Sidebar';
import { TitleBar } from './components/TitleBar/TitleBar';
import { RequestEditor } from './components/Request/RequestEditor';
import { ResponseViewer } from './components/Response/ResponseViewer';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './components/ui/resizable';
import { useRequestStore } from './store/requestStore';
import { useResponseStore } from './store/responseStore';
import { initService } from './services/initService';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initService.initializeApp();
        setIsInitialized(true);
      } catch (error) {
        console.error('Initialization error:', error);
        setInitError(error instanceof Error ? error.message : 'Failed to initialize application');
      }
    };

    initialize();
  }, []);

  if (initError) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-semibold mb-4 text-destructive">初始化失败</h2>
          <p className="text-sm text-muted-foreground mb-4">{initError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">正在加载...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <TitleBar />
      <div className="flex-1 overflow-hidden">
        <MainLayout sidebar={<Sidebar />}>
          <MainContent />
        </MainLayout>
      </div>
    </div>
  );
}

function MainContent() {
  const { currentRequest } = useRequestStore();
  const { responseData, isLoading, error } = useResponseStore();

  if (!currentRequest.id) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">欢迎使用 PostBoy</h2>
          <p className="text-sm">选择或创建一个请求开始测试 API</p>
        </div>
      </div>
    );
  }

  return (
    <ResizablePanelGroup direction="vertical">
      <ResizablePanel defaultSize={50} minSize={30}>
        <RequestEditor />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50} minSize={30}>
        <ResponseViewer response={responseData} isLoading={isLoading} error={error} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export default App;
