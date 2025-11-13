import { WorkspaceList } from './WorkspaceList';
import { WorkspaceTree } from './WorkspaceTree';

export function Sidebar() {
  return (
    <div className="h-full flex flex-col">
      <div className="h-48 border-b">
        <WorkspaceList />
      </div>
      <div className="flex-1 overflow-hidden">
        <WorkspaceTree />
      </div>
    </div>
  );
}
