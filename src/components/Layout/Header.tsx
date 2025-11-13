import { Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkspaceStore } from '@/store/workspaceStore';
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

export function Header() {
  const { exportConfig, importConfig } = useWorkspaceStore();
  const [showImportDialog, setShowImportDialog] = useState(false);
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

  const handleImportConfirm = async () => {
    setImporting(true);
    try {
      await importConfig();
      setShowImportDialog(false);
      toast.success('配置导入成功');
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('配置导入失败');
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <div className="h-12 border-b flex items-center justify-end px-4 gap-2">
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" />
          导出配置
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowImportDialog(true)}>
          <Upload className="h-4 w-4" />
          导入配置
        </Button>
      </div>

      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>导入配置</DialogTitle>
            <DialogDescription>
              导入配置将会覆盖所有现有数据，包括所有 Workspace、Request Group 和 Request Item。此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)} disabled={importing}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleImportConfirm} disabled={importing}>
              {importing ? '导入中...' : '确认导入'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
