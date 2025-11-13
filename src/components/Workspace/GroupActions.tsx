import { Edit2, Trash2, MoreVertical } from 'lucide-react';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useState } from 'react';
import type { RequestGroup } from '@/types';

interface GroupActionsProps {
  group: RequestGroup;
}

export function GroupActions({ group }: GroupActionsProps) {
  const { updateGroup, deleteGroup } = useWorkspaceStore();
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [groupName, setGroupName] = useState(group.name);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleRename = async () => {
    if (!groupName.trim() || groupName === group.name) {
      setShowRenameDialog(false);
      return;
    }

    setUpdating(true);
    try {
      await updateGroup(group.id, groupName.trim());
      setShowRenameDialog(false);
    } catch (error) {
      console.error('Failed to rename group:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteGroup(group.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Failed to delete group:', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()}>
            <MoreVertical className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setGroupName(group.name);
              setShowRenameDialog(true);
            }}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            重命名
          </DropdownMenuItem>
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
            <DialogTitle>重命名分组</DialogTitle>
            <DialogDescription>为分组输入新的名称</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="分组名称"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleRename();
              }
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameDialog(false)} disabled={updating}>
              取消
            </Button>
            <Button onClick={handleRename} disabled={updating || !groupName.trim()}>
              {updating ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除分组</DialogTitle>
            <DialogDescription>
              确定要删除分组 "{group.name}"？此操作将删除该分组下的所有请求，且不可撤销。
            </DialogDescription>
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
