import { contextBridge, ipcRenderer } from 'electron';

// 暴露 electron API 到渲染进程
contextBridge.exposeInMainWorld('electron', {
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
  on: (channel: string, callback: (...args: any[]) => void) => {
    const subscription = (_event: any, ...args: any[]) => callback(...args);
    ipcRenderer.on(channel, subscription);
    return () => ipcRenderer.removeListener(channel, subscription);
  },
});
