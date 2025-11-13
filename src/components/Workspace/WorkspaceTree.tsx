import { ChevronDown, ChevronRight, Folder, FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useRequestStore } from '@/store/requestStore';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { RequestItem } from '@/types';
import { GroupActions } from './GroupActions';
import { RequestActions } from './RequestActions';
import { CreateGroupButton } from './CreateGroupButton';
import { CreateRequestButton } from './CreateRequestButton';
import { ImportCurlButton } from './ImportCurlButton';

export function WorkspaceTree() {
  const { groups, requests, currentWorkspaceId } = useWorkspaceStore();
  const { loadRequest } = useRequestStore();
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);

  const toggleGroup = (groupId: number) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const handleRequestClick = (request: RequestItem) => {
    setSelectedRequestId(request.id);
    loadRequest(
      request.id,
      request.groupId,
      request.name,
      request.method,
      request.url,
      request.headers,
      request.body,
      request.bodyType
    );
  };

  const getRequestsByGroup = (groupId: number) => {
    return requests.filter((req) => req.groupId === groupId);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'text-green-600';
      case 'POST':
        return 'text-blue-600';
      case 'PUT':
        return 'text-orange-600';
      case 'DELETE':
        return 'text-red-600';
      case 'OPTIONS':
        return 'text-purple-600';
      case 'HEAD':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!currentWorkspaceId) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-muted-foreground p-4 text-center">
        请选择一个工作空间
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-2 border-b">
          <CreateGroupButton />
        </div>
        <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground p-4 text-center">
          暂无分组，请创建一个分组
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 border-b">
        <CreateGroupButton />
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {groups.map((group) => {
            const isExpanded = expandedGroups.has(group.id);
            const groupRequests = getRequestsByGroup(group.id);

            return (
              <div key={group.id} className="mb-1">
                <div
                  className="flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer group"
                  onClick={() => toggleGroup(group.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Folder className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm flex-1 truncate">{group.name}</span>
                  <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100">
                    {groupRequests.length}
                  </span>
                  <GroupActions group={group} />
                </div>

                {isExpanded && (
                  <div className="ml-6 mt-1 space-y-0.5">
                    <CreateRequestButton groupId={group.id} />
                    <ImportCurlButton groupId={group.id} />
                    {groupRequests.length === 0 ? (
                      <div className="px-2 py-1.5 text-xs text-muted-foreground">暂无请求</div>
                    ) : (
                      groupRequests.map((request) => (
                        <div
                          key={request.id}
                          className={cn(
                            'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer group',
                            selectedRequestId === request.id && 'bg-accent'
                          )}
                          onClick={() => handleRequestClick(request)}
                        >
                          <FileText className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          <span className={cn('text-xs font-medium flex-shrink-0 w-12', getMethodColor(request.method))}>
                            {request.method}
                          </span>
                          <span className="text-sm truncate flex-1">{request.name}</span>
                          <RequestActions request={request} />
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
