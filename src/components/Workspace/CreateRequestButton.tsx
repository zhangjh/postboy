import { FilePlus } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useState } from 'react';
import type { HttpMethod } from '@/types';

interface CreateRequestButtonProps {
  groupId: number;
}

export function CreateRequestButton({ groupId }: CreateRequestButtonProps) {
  const { createRequest } = useWorkspaceStore();
  const [showDialog, setShowDialog] = useState(false);
  const [requestName, setRequestName] = useState('');
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [url, setUrl] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!requestName.trim() || !url.trim()) return;

    setCreating(true);
    try {
      await createRequest(groupId, {
        name: requestName.trim(),
        method,
        url: url.trim(),
        headers: {},
        body: '',
        bodyType: 'json',
      });
      setRequestName('');
      setMethod('GET');
      setUrl('');
      setShowDialog(false);
    } catch (error) {
      console.error('Failed to create request:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setShowDialog(true)} className="w-full justify-start">
        <FilePlus className="h-4 w-4" />
        创建请求
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建请求</DialogTitle>
            <DialogDescription>为新的请求输入基本信息</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input
                placeholder="请求名称"
                value={requestName}
                onChange={(e) => setRequestName(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={method} onValueChange={(value) => setMethod(value as HttpMethod)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="OPTIONS">OPTIONS</SelectItem>
                  <SelectItem value="HEAD">HEAD</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={creating}>
              取消
            </Button>
            <Button onClick={handleCreate} disabled={creating || !requestName.trim() || !url.trim()}>
              {creating ? '创建中...' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
