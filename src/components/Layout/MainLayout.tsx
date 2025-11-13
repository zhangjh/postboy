import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Header } from './Header';

interface MainLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export function MainLayout({ sidebar, children }: MainLayoutProps) {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
            <div className="h-full overflow-hidden">{sidebar}</div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={80}>
            <div className="h-full overflow-hidden">{children}</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
