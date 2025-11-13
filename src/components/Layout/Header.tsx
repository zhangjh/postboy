import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRequestStore } from '@/store/requestStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { toast } from 'sonner';
import { generateCurl } from '@/services/curlService';

export function Header() {
  const { currentRequest } = useRequestStore();
  const [showExportCurlDialog, setShowExportCurlDialog] = useState(false);
  const [curlCommand, setCurlCommand] = useState('');

  const hasActiveRequest = !!currentRequest.url;

  const handleExportCurl = () => {
    try {
      const platform = window.navigator.platform.toLowerCase().includes('win') ? 'win32' : 
                      window.navigator.platform.toLowerCase().includes('mac') ? 'darwin' : 'linux';
      const curl = generateCurl({
        method: currentRequest.method,
        url: currentRequest.url,
        headers: currentRequest.headers,
        body: currentRequest.body,
      }, platform as 'win32' | 'darwin' | 'linux');
      setCurlCommand(curl);
      setShowExportCurlDialog(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '生成 cURL 命令失败';
      toast.error(errorMessage);
    }
  };

  const handleCopyCurl = async () => {
    try {
      await navigator.clipboard.writeText(curlCommand);
      toast.success('cURL 命令已复制到剪贴板');
      setShowExportCurlDialog(false);
    } catch (error) {
      toast.error('复制到剪贴板失败');
    }
  };

  return (
    <>
      <div className="h-12 border-b flex items-center justify-end px-4 gap-2">
        <Button variant="outline" size="sm" onClick={handleExportCurl} disabled={!hasActiveRequest}>
          <Download className="h-4 w-4" />
          导出 cURL
        </Button>
      </div>

      <Dialog open={showExportCurlDialog} onOpenChange={setShowExportCurlDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>导出为 cURL 命令</DialogTitle>
            <DialogDescription>
              复制下方的 cURL 命令以在终端或其他工具中使用
            </DialogDescription>
          </DialogHeader>
          <div className="my-4">
            <textarea
              value={curlCommand}
              readOnly
              className="w-full min-h-[120px] p-3 font-mono text-sm border rounded-md resize-y bg-muted"
              onClick={(e) => e.currentTarget.select()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportCurlDialog(false)}>
              关闭
            </Button>
            <Button onClick={handleCopyCurl}>
              复制到剪贴板
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
