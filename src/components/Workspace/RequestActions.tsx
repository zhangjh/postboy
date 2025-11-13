import { Trash2, MoreVertical, Edit2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useRequestStore } from '@/store/requestStore';
import { useState } from 'react';
import { toast } from 'sonner';
import type { RequestItem } from '@/types';

interface RequestActionsProps {
  request: RequestItem;
}

export function RequestActions({ request }: RequestActionsProps) {
  const { deleteRequest, updateRequest, createRequest } = useWorkspaceStore();
  const { loadRequest } = useRequestStore();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [newName, setNewName] = useState(request.name);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteRequest(request.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Failed to delete request:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleRename = async () => {
    if (!newName.trim()) {
      toast.error('请求名称不能为空');
      return;
    }

    setRenaming(true);
    try {
      await updateRequest(request.id, { name: newName.trim() });
      setShowRenameDialog(false);
      toast.success('重命名成功');
    } catch (error) {
      console.error('Failed to rename request:', error);
    } finally {
      setRenaming(false);
    }
  };

  const handleDuplicate = async () => {
    setDuplicating(true);
    try {
      const duplicatedRequest = await createRequest(request.groupId, {
        name: `${request.name} (副本)`,
        method: request.method,
        url: request.url,
        headers: request.headers,
        body: request.body,
        bodyMode: request.bodyMode,
        rawType: request.rawType,
        formData: request.formData,
      });

      loadRequest(
        duplicatedRequest.id,
        duplicatedRequest.groupId,
        duplicatedRequest.name,
        duplicatedRequest.method,
        duplicatedRequest.url,
        duplicatedRequest.headers,
        duplicatedRequest.body,
        duplicatedRequest.bodyMode,
        duplicatedRequest.rawType,
        duplicatedRequest.formData
      );

      toast.success('复制成功');
    } catch (error) {
      console.error('Failed to duplicate request:', error);
    } finally {
      setDuplicating(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-50 group-hover:opacity-100 hover:opacity-100 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setNewName(request.name);
              setShowRenameDialog(true);
            }}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            重命名
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleDuplicate();
            }}
            disabled={duplicating}
          >
            <Copy className="h-4 w-4 mr-2" />
            {duplicating ? '复制中...' : '复制'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteDialog(true);
            }}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>重命名请求</DialogTitle>
            <DialogDescription>为请求设置一个新的名称</DialogDescription>
          </DialogHeader>
          <div className="my-4">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRename();
                }
              }}
              placeholder="请求名称"
              className="w-full p-2 text-sm border rounded-md"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRenameDialog(false)}
              disabled={renaming}
            >
              取消
            </Button>
            <Button onClick={handleRename} disabled={!newName.trim() || renaming}>
              {renaming ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除请求</DialogTitle>
            <DialogDescription>确定要删除请求 "{request.name}"？此操作不可撤销。</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleting}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? '删除中...' : '删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
