import { useRequestStore } from '../../store/requestStore';
import { useResponseStore } from '../../store/responseStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { MethodSelector } from './MethodSelector';
import { UrlInput } from './UrlInput';
import { HeadersEditor } from './HeadersEditor';
import { BodyEditor } from './BodyEditor';
import { RequestActions } from './RequestActions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner';
import type { HttpMethod, RequestConfig } from '../../types';

const METHODS_WITH_BODY: HttpMethod[] = ['POST', 'PUT', 'DELETE'];

export function RequestEditor() {
  const { currentRequest, setMethod, setUrl, setBody, setBodyType, saveRequest } = useRequestStore();
  const { sendRequest, isLoading } = useResponseStore();
  const { currentWorkspaceId, groups } = useWorkspaceStore();

  const showBodyEditor = METHODS_WITH_BODY.includes(currentRequest.method);

  const handleHeadersChange = (headers: Record<string, string>) => {
    useRequestStore.setState((state) => ({
      currentRequest: {
        ...state.currentRequest,
        headers,
      },
    }));
  };

  const handleSend = async () => {
    const config: RequestConfig = {
      method: currentRequest.method,
      url: currentRequest.url,
      headers: currentRequest.headers,
      body: currentRequest.body,
    };

    await sendRequest(config);
  };

  const handleSave = async () => {
    try {
      const isNewRequest = !currentRequest.id;
      const targetGroupId = currentRequest.groupId || groups[0]?.id;
      
      if (!targetGroupId) {
        toast.error('请先创建一个分组');
        return;
      }

      await saveRequest(targetGroupId);
      
      if (currentWorkspaceId) {
        await useWorkspaceStore.getState().selectWorkspace(currentWorkspaceId);
      }
      
      toast.success(isNewRequest ? '请求已创建' : '请求已保存');
    } catch (error) {
      toast.error('保存失败');
      console.error('Failed to save request:', error);
    }
  };

  const canSave = !!currentWorkspaceId && groups.length > 0;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center gap-2">
          <MethodSelector value={currentRequest.method} onChange={setMethod} />
          <UrlInput value={currentRequest.url} onChange={setUrl} />
        </div>

        <RequestActions
          isLoading={isLoading}
          canSave={canSave}
          requestConfig={{
            method: currentRequest.method,
            url: currentRequest.url,
            headers: currentRequest.headers,
            body: currentRequest.body,
          }}
          onSend={handleSend}
          onSave={handleSave}
        />
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <Tabs defaultValue="headers" className="w-full">
            <TabsList>
              <TabsTrigger value="headers">Headers</TabsTrigger>
              {showBodyEditor && <TabsTrigger value="body">Body</TabsTrigger>}
            </TabsList>

            <TabsContent value="headers" className="mt-4">
              <HeadersEditor
                headers={currentRequest.headers}
                onHeadersChange={handleHeadersChange}
              />
            </TabsContent>

            {showBodyEditor && (
              <TabsContent value="body" className="mt-4 h-[400px]">
                <BodyEditor
                  body={currentRequest.body || ''}
                  bodyType={currentRequest.bodyType || 'text'}
                  onBodyChange={setBody}
                  onBodyTypeChange={setBodyType}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}
