export interface ElectronAPI {
  invoke: (channel: string, ...args: any[]) => Promise<any>;
  on: (channel: string, callback: (...args: any[]) => void) => () => void;
  windowControl: (action: 'minimize' | 'maximize' | 'close') => void;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {};
