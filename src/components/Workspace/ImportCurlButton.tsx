import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useRequestStore } from '@/store/requestStore';
import { parseCurl } from '@/services/curlService';
import { toast } from 'sonner';

interface ImportCurlButtonProps {
  groupId: number;
}

export function ImportCurlButton({ groupId }: ImportCurlButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [curlInput, setCurlInput] = useState('');
  const [requestName, setRequestName] = useState('');
  const [importing, setImporting] = useState(false);
  const { createRequest } = useWorkspaceStore();
  const { loadRequest } = useRequestStore();

  const handleImport = async () => {
    if (!curlInput.trim()) {
      toast.error('请输入 cURL 命令');
      return;
    }

    setImporting(true);
    try {
      const parsed = parseCurl(curlInput.trim());
      
      if (!parsed.url) {
        toast.error('无效的 cURL 命令：缺少 URL');
        return;
      }

      const defaultName = `导入的请求 - ${parsed.method} ${new URL(parsed.url).pathname}`;
      
      const newRequest = await createRequest(groupId, {
        name: requestName.trim() || defaultName,
        method: parsed.method,
        url: parsed.url,
        headers: parsed.headers,
        body: parsed.body,
        bodyType: parsed.body ? 'text' : undefined,
      });

      loadRequest(
        newRequest.id,
        newRequest.groupId,
        newRequest.name,
        newRequest.method,
        newRequest.url,
        newRequest.headers,
        newRequest.body,
        newRequest.bodyType
      );

      toast.success('cURL 命令导入成功');
      setShowDialog(false);
      setCurlInput('');
      setRequestName('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '解析 cURL 命令失败';
      toast.error(errorMessage);
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-xs h-7"
        onClick={() => setShowDialog(true)}
      >
        <Upload className="h-3 w-3 mr-2" />
        导入 cURL
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>从 cURL 导入</DialogTitle>
            <DialogDescription>
              粘贴 cURL 命令以导入请求配置，将自动创建一个新的请求
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="request-name" className="text-sm font-medium">
                请求名称（可选）
              </label>
              <input
                id="request-name"
                type="text"
                value={requestName}
                onChange={(e) => setRequestName(e.target.value)}
                placeholder="留空将自动生成名称"
                className="w-full p-2 text-sm border rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="curl-input" className="text-sm font-medium">
                cURL 命令
              </label>
              <textarea
                id="curl-input"
                value={curlInput}
                onChange={(e) => setCurlInput(e.target.value)}
                placeholder="curl -X POST https://api.example.com -H 'Content-Type: application/json' -d '{...}'"
                className="w-full min-h-[120px] p-3 font-mono text-sm border rounded-md resize-y"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                支持的格式：-X/--request, -H/--header, -d/--data/--data-raw
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowDialog(false);
              setCurlInput('');
              setRequestName('');
            }} disabled={importing}>
              取消
            </Button>
            <Button onClick={handleImport} disabled={!curlInput.trim() || importing}>
              {importing ? '导入中...' : '导入'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
