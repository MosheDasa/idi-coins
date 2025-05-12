import { contextBridge, ipcRenderer } from 'electron';

// Get the API URL from the environment or use default
const API_URL = process.env.API_URL || 'https://api.genderize.io';

contextBridge.exposeInMainWorld('electron', {
  getApiUrl: () => ipcRenderer.invoke('get-api-url')
}); 