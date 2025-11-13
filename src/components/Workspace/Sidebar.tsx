import { WorkspaceList } from './WorkspaceList';
import { WorkspaceTree } from './WorkspaceTree';
import { SettingsButton } from './SettingsButton';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

export function Sidebar() {
  return (
    <div className="h-full flex flex-col">
      {/* 上部可调整区域 - 占据除设置按钮外的所有空间 */}
      <div className="flex-1 min-h-0">
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={40} minSize={30} maxSize={60}>
            <WorkspaceList />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={60} minSize={30}>
            <WorkspaceTree />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      
      {/* 底部固定设置按钮 - 固定高度 */}
      <div className="h-12 flex-shrink-0 border-t p-2 bg-background">
        <SettingsButton />
      </div>
    </div>
  );
}
