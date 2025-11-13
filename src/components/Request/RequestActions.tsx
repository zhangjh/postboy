import { Button } from '../ui/button';
import { Send, Save } from 'lucide-react';
import type { RequestConfig } from '../../types';

interface RequestActionsProps {
  isLoading: boolean;
  canSave: boolean;
  requestConfig: RequestConfig;
  onSend: () => void;
  onSave: () => void;
}

export function RequestActions({
  isLoading,
  canSave,
  requestConfig,
  onSend,
  onSave,
}: RequestActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={onSend}
        disabled={isLoading || !requestConfig.url}
        className="min-w-[100px]"
      >
        <Send className="h-4 w-4 mr-2" />
        {isLoading ? '发送中...' : '发送'}
      </Button>

      <Button
        variant="outline"
        onClick={onSave}
        disabled={!canSave || !requestConfig.url}
      >
        <Save className="h-4 w-4 mr-2" />
        保存
      </Button>
    </div>
  );
}
