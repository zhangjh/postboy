import { useWorkspaceStore } from '../store/workspaceStore';
import { useRequestStore } from '../store/requestStore';
import { useResponseStore } from '../store/responseStore';

const STORAGE_KEYS = {
  LAST_WORKSPACE_ID: 'postboy_last_workspace_id',
  LAST_REQUEST_ID: 'postboy_last_request_id',
};

export class InitService {
  async initializeApp(): Promise<void> {
    try {
      await this.loadWorkspaces();
      await this.restoreLastSession();
    } catch (error) {
      console.error('Failed to initialize application:', error);
      throw error;
    }
  }

  private async loadWorkspaces(): Promise<void> {
    const { loadWorkspaces } = useWorkspaceStore.getState();
    await loadWorkspaces();
  }

  private async restoreLastSession(): Promise<void> {
    try {
      const lastWorkspaceId = localStorage.getItem(STORAGE_KEYS.LAST_WORKSPACE_ID);
      const lastRequestId = localStorage.getItem(STORAGE_KEYS.LAST_REQUEST_ID);

      if (lastWorkspaceId) {
        const workspaceId = parseInt(lastWorkspaceId, 10);
        const { workspaces, selectWorkspace } = useWorkspaceStore.getState();
        
        const workspaceExists = workspaces.some(w => w.id === workspaceId);
        if (workspaceExists) {
          await selectWorkspace(workspaceId);

          if (lastRequestId) {
            const requestId = parseInt(lastRequestId, 10);
            const { requests } = useWorkspaceStore.getState();
            const request = requests.find(r => r.id === requestId);
            
            if (request) {
              const { loadRequest } = useRequestStore.getState();
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
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to restore last session:', error);
    }
  }

  saveLastWorkspace(workspaceId: number): void {
    localStorage.setItem(STORAGE_KEYS.LAST_WORKSPACE_ID, workspaceId.toString());
  }

  saveLastRequest(requestId: number): void {
    localStorage.setItem(STORAGE_KEYS.LAST_REQUEST_ID, requestId.toString());
  }

  clearLastSession(): void {
    localStorage.removeItem(STORAGE_KEYS.LAST_WORKSPACE_ID);
    localStorage.removeItem(STORAGE_KEYS.LAST_REQUEST_ID);
  }
}

export const initService = new InitService();
