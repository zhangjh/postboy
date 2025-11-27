import { useState, useEffect, useRef } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { X } from 'lucide-react';

interface HeaderRow {
  key: string;
  value: string;
  id: string;
}

interface HeadersEditorProps {
  headers: Record<string, string>;
  onHeadersChange: (headers: Record<string, string>) => void;
}

export function HeadersEditor({ headers, onHeadersChange }: HeadersEditorProps) {
  const [rows, setRows] = useState<HeaderRow[]>([{ key: '', value: '', id: `header-new-${Date.now()}` }]);
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    const headerRows: HeaderRow[] = Object.entries(headers).map(([key, value], index) => ({
      key,
      value,
      id: `header-${index}-${key}`,
    }));
    
    const hasEmptyRow = headerRows.some(row => !row.key.trim() && !row.value.trim());
    if (!hasEmptyRow) {
      headerRows.push({ key: '', value: '', id: `header-new-${Date.now()}` });
    }
    
    setRows(headerRows);
  }, [headers]);

  const updateHeaders = (updatedRows: HeaderRow[]) => {
    const newHeaders: Record<string, string> = {};
    updatedRows.forEach((row) => {
      if (row.key.trim()) {
        newHeaders[row.key.trim()] = row.value;
      }
    });
    isInternalUpdate.current = true;
    onHeadersChange(newHeaders);
  };

  const handleKeyChange = (id: string, newKey: string) => {
    const updatedRows = rows.map((row) => {
      if (row.id === id) {
        return { ...row, key: newKey };
      }
      return row;
    });

    const currentRow = updatedRows.find((r) => r.id === id);
    if (currentRow && currentRow.key.trim() && currentRow.value.trim()) {
      const isLastRow = id === updatedRows[updatedRows.length - 1].id;
      if (isLastRow) {
        updatedRows.push({ key: '', value: '', id: `header-new-${Date.now()}` });
      }
    }

    setRows(updatedRows);
    updateHeaders(updatedRows);
  };

  const handleValueChange = (id: string, newValue: string) => {
    const updatedRows = rows.map((row) => {
      if (row.id === id) {
        return { ...row, value: newValue };
      }
      return row;
    });

    const currentRow = updatedRows.find((r) => r.id === id);
    if (currentRow && currentRow.key.trim() && currentRow.value.trim()) {
      const isLastRow = id === updatedRows[updatedRows.length - 1].id;
      if (isLastRow) {
        updatedRows.push({ key: '', value: '', id: `header-new-${Date.now()}` });
      }
    }

    setRows(updatedRows);
    updateHeaders(updatedRows);
  };

  const handleDelete = (id: string) => {
    const updatedRows = rows.filter((row) => row.id !== id);
    
    if (updatedRows.length === 0 || updatedRows[updatedRows.length - 1].key.trim()) {
      updatedRows.push({ key: '', value: '', id: `header-new-${Date.now()}` });
    }

    setRows(updatedRows);
    updateHeaders(updatedRows);
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-sm font-medium text-muted-foreground px-2">
        <div>Key</div>
        <div>Value</div>
        <div className="w-8"></div>
      </div>
      
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {rows.map((row) => (
          <div key={row.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
            <Input
              type="text"
              value={row.key}
              onChange={(e) => handleKeyChange(row.id, e.target.value)}
              placeholder="Header name"
              className="font-mono text-sm"
            />
            <Input
              type="text"
              value={row.value}
              onChange={(e) => handleValueChange(row.id, e.target.value)}
              placeholder="Header value"
              className="font-mono text-sm"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(row.id)}
              disabled={!row.key.trim()}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
