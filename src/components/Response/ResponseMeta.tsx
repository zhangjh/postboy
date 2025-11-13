import type { ResponseData } from '../../types';

interface ResponseMetaProps {
  response: ResponseData;
}

export function ResponseMeta({ response }: ResponseMetaProps) {
  const { status, statusText, duration, size } = response;
  
  const isSuccess = status >= 200 && status < 300;
  const isRedirect = status >= 300 && status < 400;
  const isClientError = status >= 400 && status < 500;
  const isServerError = status >= 500;
  
  const statusColor = isSuccess
    ? 'text-green-600'
    : isRedirect
    ? 'text-blue-600'
    : isClientError
    ? 'text-orange-600'
    : isServerError
    ? 'text-red-600'
    : 'text-gray-600';
  
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };
  
  return (
    <div className="flex items-center gap-6 px-4 py-3 border-b bg-muted/30">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Status:</span>
        <span className={`text-sm font-semibold ${statusColor}`}>
          {status} {statusText}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Time:</span>
        <span className="text-sm font-medium">
          {duration < 1000 ? `${duration} ms` : `${(duration / 1000).toFixed(2)} s`}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Size:</span>
        <span className="text-sm font-medium">{formatSize(size)}</span>
      </div>
    </div>
  );
}
