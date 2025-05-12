import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    getApiUrl: async () => {
      try {
        return await ipcRenderer.invoke('get-api-url');
      } catch (error) {
        console.error('Error getting API URL:', error);
        return 'https://api.genderize.io';
      }
    },
    getSettings: () => ipcRenderer.invoke('get-settings'),
    saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings)
  }
); 