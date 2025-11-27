import { useState, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { formatXML } from '../../services/formatService';

interface ResponseBodyProps {
  data: any;
  contentType: string;
}

type ViewMode = 'formatted' | 'preview';

export function ResponseBody({ data, contentType }: ResponseBodyProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('formatted');
  
  const isJsonData = useMemo(() => {
    if (typeof data === 'object' && data !== null && data.type !== 'binary') {
      return true;
    }
    if (typeof data === 'string') {
      const trimmed = data.trim();
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
          (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try {
          JSON.parse(trimmed);
          return true;
        } catch {
          return false;
        }
      }
    }
    return false;
  }, [data]);
  
  const responseType = useMemo(() => {
    if (isJsonData) {
      return 'json';
    }
    
    const type = contentType.toLowerCase();
    
    if (type.includes('application/json') || type.includes('text/json')) {
      return 'json';
    }
    if (type.includes('application/xml') || type.includes('text/xml')) {
      return 'xml';
    }
    if (type.includes('text/html')) {
      return 'html';
    }
    if (type.includes('image/')) {
      return 'image';
    }
    if (type.includes('text/')) {
      return 'text';
    }
    
    return 'text';
  }, [contentType, isJsonData]);
  
  const formattedContent = useMemo(() => {
    console.log('ResponseBody Debug:', {
      dataType: typeof data,
      isArray: Array.isArray(data),
      responseType,
      contentType,
      dataPreview: typeof data === 'string' ? data.substring(0, 100) : data
    });
    
    if (responseType === 'json') {
      try {
        if (typeof data === 'string') {
          const parsed = JSON.parse(data);
          const formatted = JSON.stringify(parsed, null, 2);
          console.log('Formatted JSON from string:', formatted.substring(0, 100));
          return formatted;
        }
        if (typeof data === 'object' && data !== null && data.type !== 'binary') {
          const formatted = JSON.stringify(data, null, 2);
          console.log('Formatted JSON from object:', formatted.substring(0, 100));
          return formatted;
        }
      } catch (error) {
        console.error('JSON formatting error:', error);
      }
      return typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    }
    
    if (responseType === 'xml' && typeof data === 'string') {
      const result = formatXML(data);
      return result.success ? result.formatted! : data;
    }
    
    if (typeof data === 'string') {
      return data;
    }
    
    if (typeof data === 'object' && data !== null) {
      return JSON.stringify(data, null, 2);
    }
    
    return String(data);
  }, [data, responseType, contentType]);
  
  const editorLanguage = useMemo(() => {
    switch (responseType) {
      case 'json':
        return 'json';
      case 'xml':
      case 'html':
        return 'xml';
      case 'text':
      default:
        return 'plaintext';
    }
  }, [responseType]);
  
  if (responseType === 'image') {
    const imageUrl = typeof data === 'string' && data.startsWith('data:') 
      ? data 
      : `data:${contentType};base64,${data}`;
    
    return (
      <div className="flex items-center justify-center h-full p-8 bg-muted/30">
        <img 
          src={imageUrl} 
          alt="Response" 
          className="max-w-full max-h-full object-contain"
        />
      </div>
    );
  }
  
  if (responseType === 'html') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/30">
          <Button
            variant={viewMode === 'formatted' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('formatted')}
          >
            Code
          </Button>
          <Button
            variant={viewMode === 'preview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('preview')}
          >
            Preview
          </Button>
        </div>
        
        {viewMode === 'formatted' ? (
          <Editor
            height="100%"
            language="html"
            value={formattedContent}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              lineNumbers: 'on',
              wordWrap: 'on',
            }}
            theme="vs-light"
          />
        ) : (
          <ScrollArea className="flex-1">
            <iframe
              srcDoc={formattedContent}
              title="HTML Preview"
              className="w-full h-full border-0"
              sandbox="allow-same-origin"
              style={{ minHeight: '100%' }}
            />
          </ScrollArea>
        )}
      </div>
    );
  }
  
  return (
    <Editor
      height="100%"
      language={editorLanguage}
      value={formattedContent}
      options={{
        readOnly: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        lineNumbers: 'on',
        wordWrap: 'off',
        automaticLayout: true,
        formatOnPaste: true,
        formatOnType: true,
      }}
      theme="vs-light"
    />
  );
}
