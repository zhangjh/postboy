import { useState } from 'react';
import { Settings, Download, Upload, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { toast } from 'sonner';

export function SettingsButton() {
  const [showDialog, setShowDialog] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const { exportConfig, importConfig } = useWorkspaceStore();
  const [importing, setImporting] = useState(false);

  const handleExport = async () => {
    try {
      await exportConfig();
      toast.success('配置导出成功');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('配置导出失败');
    }
  };

  const handleImportClick = () => {
    setShowDialog(false);
    setShowImportConfirm(true);
  };

  const handleImportConfirm = async () => {
    setImporting(true);
    try {
      await importConfig();
      setShowImportConfirm(false);
      toast.success('配置导入成功');
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('配置导入失败');
    } finally {
      setImporting(false);
    }
  };

  const handleCheckUpdate = () => {
    toast.info('检查更新功能即将推出');
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => setShowDialog(true)}
      >
        <Settings className="h-4 w-4 mr-2" />
        设置
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>设置</DialogTitle>
            <DialogDescription>管理应用配置和更新</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <h3 className="text-sm font-medium mb-3">数据管理</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleExport}
                >
                  <Download className="h-4 w-4 mr-2" />
                  导出配置
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleImportClick}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  导入配置
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-3">应用更新</h3>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleCheckUpdate}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                检查更新
              </Button>
            </div>

            <Separator />

            <div className="text-xs text-muted-foreground space-y-1">
              <p>PostBoy v0.1.0</p>
              <p>轻量级 HTTP 客户端</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showImportConfirm} onOpenChange={setShowImportConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认导入配置</DialogTitle>
            <DialogDescription>
              导入配置将会覆盖所有现有数据，包括所有工作空间、分组和请求。此操作不可撤销，请确保已备份重要数据。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowImportConfirm(false)}
              disabled={importing}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleImportConfirm}
              disabled={importing}
            >
              {importing ? '导入中...' : '确认导入'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
