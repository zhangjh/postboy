import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function WorkspaceList() {
  const { workspaces, currentWorkspaceId, selectWorkspace, createWorkspace, deleteWorkspace } = useWorkspaceStore();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [deleteWorkspaceId, setDeleteWorkspaceId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleCreate = async () => {
    if (!workspaceName.trim()) return;
    
    setCreating(true);
    try {
      await createWorkspace(workspaceName.trim());
      setWorkspaceName('');
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Failed to create workspace:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteClick = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteWorkspaceId(id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteWorkspaceId === null) return;
    
    setDeleting(true);
    try {
      await deleteWorkspace(deleteWorkspaceId);
      setShowDeleteDialog(false);
      setDeleteWorkspaceId(null);
    } catch (error) {
      console.error('Failed to delete workspace:', error);
    } finally {
      setDeleting(false);
    }
  };

  const deleteWorkspaceName = workspaces.find((w) => w.id === deleteWorkspaceId)?.name;

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="p-3 border-b flex items-center justify-between">
          <h2 className="font-semibold text-sm">工作空间</h2>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {workspaces.map((workspace) => (
              <div
                key={workspace.id}
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-md cursor-pointer hover:bg-accent group',
                  currentWorkspaceId === workspace.id && 'bg-accent'
                )}
                onClick={() => selectWorkspace(workspace.id)}
              >
                <span className="text-sm truncate flex-1">{workspace.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={(e) => handleDeleteClick(workspace.id, e)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建工作空间</DialogTitle>
            <DialogDescription>为新的工作空间输入一个名称</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="工作空间名称"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreate();
              }
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={creating}>
              取消
            </Button>
            <Button onClick={handleCreate} disabled={creating || !workspaceName.trim()}>
              {creating ? '创建中...' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除工作空间</DialogTitle>
            <DialogDescription>
              确定要删除工作空间 "{deleteWorkspaceName}"？此操作将删除该工作空间下的所有分组和请求，且不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleting}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleting}>
              {deleting ? '删除中...' : '删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
