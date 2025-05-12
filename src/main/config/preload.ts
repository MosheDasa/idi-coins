import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    getApiUrl: () => ipcRenderer.invoke('get-api-url'),
    getSettings: () => ipcRenderer.invoke('get-settings'),
    saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
    minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
    closeWindow: () => ipcRenderer.invoke('close-window'),
    openLogsDirectory: () => ipcRenderer.invoke('open-logs-directory'),
    writeLog: (level: string, message: string, data?: any) => ipcRenderer.invoke('write-log', level, message, data)
  }
); 