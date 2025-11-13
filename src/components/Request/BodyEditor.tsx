import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Wand2 } from 'lucide-react';
import { formatJSON, formatXML } from '../../services/formatService';
import { toast } from 'sonner';

interface BodyEditorProps {
  body: string;
  bodyType: 'text' | 'json' | 'xml';
  onBodyChange: (body: string) => void;
  onBodyTypeChange: (bodyType: 'text' | 'json' | 'xml') => void;
}

const BODY_TYPE_LANGUAGE_MAP = {
  text: 'plaintext',
  json: 'json',
  xml: 'xml',
};

export function BodyEditor({ body, bodyType, onBodyChange, onBodyTypeChange }: BodyEditorProps) {
  const [isFormatting, setIsFormatting] = useState(false);

  const handleFormat = () => {
    setIsFormatting(true);
    
    try {
      if (bodyType === 'json') {
        const result = formatJSON(body);
        if (result.success && result.formatted) {
          onBodyChange(result.formatted);
          toast.success('JSON formatted successfully');
        } else {
          toast.error(result.error || 'Failed to format JSON');
        }
      } else if (bodyType === 'xml') {
        const result = formatXML(body);
        if (result.success && result.formatted) {
          onBodyChange(result.formatted);
          toast.success('XML formatted successfully');
        } else {
          toast.error(result.error || 'Failed to format XML');
        }
      } else {
        toast.info('Text format does not require formatting');
      }
    } finally {
      setIsFormatting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        <Select value={bodyType} onValueChange={(val) => onBodyTypeChange(val as 'text' | 'json' | 'xml')}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="json">JSON</SelectItem>
            <SelectItem value="xml">XML</SelectItem>
          </SelectContent>
        </Select>
        
        {(bodyType === 'json' || bodyType === 'xml') && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleFormat}
            disabled={isFormatting || !body.trim()}
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Format
          </Button>
        )}
      </div>

      <div className="flex-1 border rounded-md overflow-hidden">
        <Editor
          height="100%"
          language={BODY_TYPE_LANGUAGE_MAP[bodyType]}
          value={body}
          onChange={(value) => onBodyChange(value || '')}
          theme="vs"
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
          }}
        />
      </div>
    </div>
  );
}
