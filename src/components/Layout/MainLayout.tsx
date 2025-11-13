import { useState } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { PanelLeftClose, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from './Header';

interface MainLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export function MainLayout({ sidebar, children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="h-full flex flex-col">
      <Header />
      <div className="flex-1 overflow-hidden relative">
        {!sidebarCollapsed ? (
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
              <div className="h-full flex flex-col">
                <div className="flex-shrink-0 h-10 border-b flex items-center justify-end px-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setSidebarCollapsed(true)}
                  >
                    <PanelLeftClose className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 overflow-hidden">{sidebar}</div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={80}>
              <div className="h-full overflow-hidden">{children}</div>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <div className="h-full flex">
            <div className="w-12 border-r flex flex-col items-center py-2 bg-background">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setSidebarCollapsed(false)}
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">{children}</div>
          </div>
        )}
      </div>
    </div>
  );
}
