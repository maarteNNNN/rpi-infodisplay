import { contextBridge, ipcRenderer } from 'electron/renderer';

contextBridge.exposeInMainWorld('electronAPI', {
  setConsoleText: (callback) =>
    ipcRenderer.on('setConsoleText', (_event, value) => callback(value)),
});
