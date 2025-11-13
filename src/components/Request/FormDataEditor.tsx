import { Plus, Trash2, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRef } from 'react';

interface FormDataItem {
  key: string;
  value: string;
  type: 'text' | 'file';
  enabled: boolean;
}

interface FormDataEditorProps {
  items: FormDataItem[];
  onChange: (items: FormDataItem[]) => void;
  isFormData?: boolean;
}

export function FormDataEditor({ items, onChange, isFormData = true }: FormDataEditorProps) {
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const handleAdd = () => {
    onChange([...items, { key: '', value: '', type: 'text', enabled: true }]);
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleKeyChange = (index: number, key: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], key };
    onChange(newItems);
  };

  const handleValueChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], value };
    onChange(newItems);
  };

  const handleTypeChange = (index: number, type: 'text' | 'file') => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], type, value: '' };
    onChange(newItems);
  };

  const handleToggle = (index: number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], enabled: !newItems[index].enabled };
    onChange(newItems);
  };

  const handleFileSelect = (index: number) => {
    fileInputRefs.current[index]?.click();
  };

  const handleFileChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newItems = [...items];
      const filePath = (file as any).path || file.name;
      newItems[index] = { ...newItems[index], value: filePath };
      onChange(newItems);
    }
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[auto_1fr_auto_2fr_auto] gap-2 items-center text-xs font-medium text-muted-foreground pb-2">
        <div className="w-8"></div>
        <div>KEY</div>
        {isFormData && <div className="w-20">TYPE</div>}
        <div>VALUE</div>
        <div className="w-8"></div>
      </div>

      {items.map((item, index) => (
        <div key={index} className="grid grid-cols-[auto_1fr_auto_2fr_auto] gap-2 items-center">
          <Checkbox
            checked={item.enabled}
            onCheckedChange={() => handleToggle(index)}
          />
          <input
            type="text"
            value={item.key}
            onChange={(e) => handleKeyChange(index, e.target.value)}
            placeholder="Key"
            className="px-2 py-1.5 text-sm border rounded-md"
            disabled={!item.enabled}
          />
          {isFormData && (
            <Select
              value={item.type}
              onValueChange={(val) => handleTypeChange(index, val as 'text' | 'file')}
              disabled={!item.enabled}
            >
              <SelectTrigger className="w-20 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="file">File</SelectItem>
              </SelectContent>
            </Select>
          )}
          {item.type === 'file' && isFormData ? (
            <div className="flex gap-1">
              <input
                type="text"
                value={item.value}
                readOnly
                placeholder="选择文件..."
                className="flex-1 px-2 py-1.5 text-sm border rounded-md bg-muted"
                disabled={!item.enabled}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFileSelect(index)}
                disabled={!item.enabled}
                className="h-8"
              >
                <File className="h-3.5 w-3.5" />
              </Button>
              <input
                ref={(el) => {
                  fileInputRefs.current[index] = el;
                }}
                type="file"
                onChange={(e) => handleFileChange(index, e)}
                className="hidden"
              />
            </div>
          ) : (
            <input
              type="text"
              value={item.value}
              onChange={(e) => handleValueChange(index, e.target.value)}
              placeholder="Value"
              className="px-2 py-1.5 text-sm border rounded-md"
              disabled={!item.enabled}
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleRemove(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={handleAdd}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        添加参数
      </Button>
    </div>
  );
}
