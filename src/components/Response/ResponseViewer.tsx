import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ResponseMeta } from './ResponseMeta';
import { ResponseBody } from './ResponseBody';
import { ResponseHeaders } from './ResponseHeaders';
import type { ResponseData } from '../../types';

interface ResponseViewerProps {
  response: ResponseData | null;
  isLoading: boolean;
  error: string | null;
}

export function ResponseViewer({ response, isLoading, error }: ResponseViewerProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Sending request...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠</div>
          <h3 className="text-lg font-semibold mb-2">Request Failed</h3>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }
  
  if (!response) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-muted-foreground text-6xl mb-4">📡</div>
          <p className="text-sm text-muted-foreground">
            Send a request to see the response
          </p>
        </div>
      </div>
    );
  }
  
  const contentType = response.headers['content-type'] || 
                      response.headers['Content-Type'] || 
                      'text/plain';
  
  return (
    <div className="flex flex-col h-full">
      <ResponseMeta response={response} />
      
      <Tabs defaultValue="body" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger 
            value="body" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Body
          </TabsTrigger>
          <TabsTrigger 
            value="headers"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Headers ({Object.keys(response.headers).length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="body" className="flex-1 m-0">
          <ResponseBody data={response.data} contentType={contentType} />
        </TabsContent>
        
        <TabsContent value="headers" className="flex-1 m-0">
          <ResponseHeaders headers={response.headers} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
