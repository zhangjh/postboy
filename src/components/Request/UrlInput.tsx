import { Input } from '../ui/input';

interface UrlInputProps {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

export function UrlInput({ value, onChange, placeholder = 'Enter request URL...' }: UrlInputProps) {
  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="flex-1 font-mono text-sm"
    />
  );
}
