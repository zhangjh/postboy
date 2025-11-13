import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { HttpMethod } from '../../types';

interface MethodSelectorProps {
  value: HttpMethod;
  onChange: (method: HttpMethod) => void;
}

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'];

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'text-blue-600',
  POST: 'text-green-600',
  PUT: 'text-orange-600',
  DELETE: 'text-red-600',
  OPTIONS: 'text-purple-600',
  HEAD: 'text-gray-600',
};

export function MethodSelector({ value, onChange }: MethodSelectorProps) {
  return (
    <Select value={value} onValueChange={(val) => onChange(val as HttpMethod)}>
      <SelectTrigger className="w-[120px]">
        <SelectValue>
          <span className={METHOD_COLORS[value]}>{value}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {HTTP_METHODS.map((method) => (
          <SelectItem key={method} value={method}>
            <span className={METHOD_COLORS[method]}>{method}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
