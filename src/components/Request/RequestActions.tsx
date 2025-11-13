import { useState } from 'react';
import { Button } from '../ui/button';
import { Send, Save, Download, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { toast } from 'sonner';
import { generateCurl, parseCurl } from '../../services/curlService';
import type { RequestConfig } from '../../types';

interface RequestActionsProps {
  isLoading: boolean;
  canSave: boolean;
  requestConfig: RequestConfig;
  onSend: () => void;
  onSave: () => void;
  onImportCurl: (config: RequestConfig) => void;
}

export function RequestActions({
  isLoading,
  canSave,
  requestConfig,
  onSend,
  onSave,
  onImportCurl,
}: RequestActionsProps) {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [curlCommand, setCurlCommand] = useState('');
  const [importInput, setImportInput] = useState('');

  const handleExportCurl = () => {
    try {
      const platform = window.navigator.platform.toLowerCase().includes('win') ? 'win32' : 
                      window.navigator.platform.toLowerCase().includes('mac') ? 'darwin' : 'linux';
      const curl = generateCurl(requestConfig, platform as 'win32' | 'darwin' | 'linux');
      setCurlCommand(curl);
      setShowExportDialog(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate cURL command';
      toast.error(errorMessage);
    }
  };

  const handleCopyCurl = async () => {
    try {
      await navigator.clipboard.writeText(curlCommand);
      toast.success('cURL command copied to clipboard');
      setShowExportDialog(false);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleImportCurl = () => {
    try {
      if (!importInput.trim()) {
        toast.error('Please enter a cURL command');
        return;
      }

      const parsed = parseCurl(importInput.trim());
      
      if (!parsed.url) {
        toast.error('Invalid cURL command: URL is required');
        return;
      }

      onImportCurl({
        method: parsed.method,
        url: parsed.url,
        headers: parsed.headers,
        body: parsed.body,
      });
      
      toast.success('cURL command imported successfully');
      setShowImportDialog(false);
      setImportInput('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse cURL command';
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          onClick={onSend}
          disabled={isLoading || !requestConfig.url}
          className="min-w-[100px]"
        >
          <Send className="h-4 w-4 mr-2" />
          {isLoading ? 'Sending...' : 'Send'}
        </Button>

        <Button
          variant="outline"
          onClick={onSave}
          disabled={!canSave || !requestConfig.url}
        >
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>

        <div className="flex-1" />

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCurl}
          disabled={!requestConfig.url}
        >
          <Download className="h-4 w-4 mr-2" />
          Export cURL
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowImportDialog(true)}
        >
          <Upload className="h-4 w-4 mr-2" />
          Import cURL
        </Button>
      </div>

      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Export as cURL</DialogTitle>
            <DialogDescription>
              Copy the cURL command below to use in terminal or other tools
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
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Close
            </Button>
            <Button onClick={handleCopyCurl}>
              Copy to Clipboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Import from cURL</DialogTitle>
            <DialogDescription>
              Paste a cURL command to import the request configuration. This will replace the current request settings.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 space-y-2">
            <textarea
              value={importInput}
              onChange={(e) => setImportInput(e.target.value)}
              placeholder="curl -X POST https://api.example.com -H 'Content-Type: application/json' -d '{...}'"
              className="w-full min-h-[120px] p-3 font-mono text-sm border rounded-md resize-y"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Supported formats: -X/--request, -H/--header, -d/--data/--data-raw
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowImportDialog(false);
              setImportInput('');
            }}>
              Cancel
            </Button>
            <Button onClick={handleImportCurl} disabled={!importInput.trim()}>
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
