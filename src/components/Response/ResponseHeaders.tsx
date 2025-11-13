import { useState } from 'react';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';

interface ResponseHeadersProps {
  headers: Record<string, string>;
}

export function ResponseHeaders({ headers }: ResponseHeadersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const headerEntries = Object.entries(headers);
  
  const filteredHeaders = headerEntries.filter(([key, value]) => {
    const query = searchQuery.toLowerCase();
    return (
      key.toLowerCase().includes(query) ||
      value.toLowerCase().includes(query)
    );
  });
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Input
          type="text"
          placeholder="Search headers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4">
          {filteredHeaders.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              {searchQuery ? 'No headers match your search' : 'No headers'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHeaders.map(([key, value]) => (
                <div key={key} className="grid grid-cols-[200px_1fr] gap-4 text-sm">
                  <div className="font-medium text-foreground break-all">
                    {key}
                  </div>
                  <div className="text-muted-foreground break-all">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
