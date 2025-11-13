const { contextBridge, ipcRenderer } = require('electron');

// 暴露 electron API 到渲染进程
contextBridge.exposeInMainWorld('electron', {
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  on: (channel, callback) => {
    const subscription = (_event, ...args) => callback(...args);
    ipcRenderer.on(channel, subscription);
    return () => ipcRenderer.removeListener(channel, subscription);
  },
  windowControl: (action) => ipcRenderer.send('window-control', action),
});
