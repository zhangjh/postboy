import { FolderPlus } from 'lucide-react';
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
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useState } from 'react';

export function CreateGroupButton() {
  const { currentWorkspaceId, createGroup } = useWorkspaceStore();
  const [showDialog, setShowDialog] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!groupName.trim() || !currentWorkspaceId) return;

    setCreating(true);
    try {
      await createGroup(currentWorkspaceId, groupName.trim());
      setGroupName('');
      setShowDialog(false);
    } catch (error) {
      console.error('Failed to create group:', error);
    } finally {
      setCreating(false);
    }
  };

  if (!currentWorkspaceId) {
    return null;
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setShowDialog(true)} className="w-full">
        <FolderPlus className="h-4 w-4" />
        创建分组
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建分组</DialogTitle>
            <DialogDescription>为新的分组输入一个名称</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="分组名称"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreate();
              }
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={creating}>
              取消
            </Button>
            <Button onClick={handleCreate} disabled={creating || !groupName.trim()}>
              {creating ? '创建中...' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
