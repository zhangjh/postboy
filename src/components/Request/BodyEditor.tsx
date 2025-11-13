import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Wand2 } from 'lucide-react';
import { formatJSON, formatXML } from '../../services/formatService';
import { FormDataEditor } from './FormDataEditor';
import { toast } from 'sonner';

interface FormDataItem {
  key: string;
  value: string;
  type: 'text' | 'file';
  enabled: boolean;
}

interface BodyEditorProps {
  body: string;
  bodyMode: 'none' | 'form-data' | 'x-www-form-urlencoded' | 'raw';
  rawType: 'text' | 'json' | 'xml' | 'html' | 'javascript';
  formData?: FormDataItem[];
  onBodyChange: (body: string) => void;
  onBodyModeChange: (mode: 'none' | 'form-data' | 'x-www-form-urlencoded' | 'raw') => void;
  onRawTypeChange: (type: 'text' | 'json' | 'xml' | 'html' | 'javascript') => void;
  onFormDataChange?: (formData: FormDataItem[]) => void;
}

const RAW_TYPE_LANGUAGE_MAP = {
  text: 'plaintext',
  json: 'json',
  xml: 'xml',
  html: 'html',
  javascript: 'javascript',
};

export function BodyEditor({ 
  body, 
  bodyMode, 
  rawType, 
  formData = [], 
  onBodyChange, 
  onBodyModeChange, 
  onRawTypeChange,
  onFormDataChange 
}: BodyEditorProps) {
  const [isFormatting, setIsFormatting] = useState(false);

  const handleFormat = () => {
    setIsFormatting(true);
    
    try {
      if (rawType === 'json') {
        const result = formatJSON(body);
        if (result.success && result.formatted) {
          onBodyChange(result.formatted);
          toast.success('JSON 格式化成功');
        } else {
          toast.error(result.error || '格式化失败');
        }
      } else if (rawType === 'xml') {
        const result = formatXML(body);
        if (result.success && result.formatted) {
          onBodyChange(result.formatted);
          toast.success('XML 格式化成功');
        } else {
          toast.error(result.error || '格式化失败');
        }
      }
    } finally {
      setIsFormatting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        <Select value={bodyMode} onValueChange={(val) => onBodyModeChange(val as any)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">none</SelectItem>
            <SelectItem value="form-data">form-data</SelectItem>
            <SelectItem value="x-www-form-urlencoded">x-www-form-urlencoded</SelectItem>
            <SelectItem value="raw">raw</SelectItem>
          </SelectContent>
        </Select>
        
        {bodyMode === 'raw' && (
          <>
            <Select value={rawType} onValueChange={(val) => onRawTypeChange(val as any)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="xml">XML</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
              </SelectContent>
            </Select>
            
            {(rawType === 'json' || rawType === 'xml') && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleFormat}
                disabled={isFormatting || !body.trim()}
              >
                <Wand2 className="h-4 w-4 mr-2" />
                格式化
              </Button>
            )}
          </>
        )}
      </div>

      <div className="flex-1 border rounded-md overflow-hidden">
        {bodyMode === 'none' ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            此请求没有 body
          </div>
        ) : bodyMode === 'raw' ? (
          <Editor
            height="100%"
            language={RAW_TYPE_LANGUAGE_MAP[rawType]}
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
        ) : (bodyMode === 'form-data' || bodyMode === 'x-www-form-urlencoded') && onFormDataChange ? (
          <div className="p-4 h-full overflow-auto">
            <FormDataEditor 
              items={formData} 
              onChange={onFormDataChange}
              isFormData={bodyMode === 'form-data'}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
