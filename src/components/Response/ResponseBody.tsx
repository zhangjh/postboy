import { useState, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { formatJSON, formatXML } from '../../services/formatService';

interface ResponseBodyProps {
  data: any;
  contentType: string;
}

type ViewMode = 'formatted' | 'preview';

export function ResponseBody({ data, contentType }: ResponseBodyProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('formatted');
  
  const responseType = useMemo(() => {
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
  }, [contentType]);
  
  const formattedContent = useMemo(() => {
    if (responseType === 'json') {
      if (typeof data === 'string') {
        const result = formatJSON(data);
        return result.success ? result.formatted! : data;
      }
      return JSON.stringify(data, null, 2);
    }
    
    if (responseType === 'xml' && typeof data === 'string') {
      const result = formatXML(data);
      return result.success ? result.formatted! : data;
    }
    
    if (typeof data === 'string') {
      return data;
    }
    
    return JSON.stringify(data, null, 2);
  }, [data, responseType]);
  
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
            theme="vs-dark"
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
        wordWrap: 'on',
      }}
      theme="vs-dark"
    />
  );
}
