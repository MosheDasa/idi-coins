import { contextBridge, ipcRenderer } from 'electron';

// Get the API URL from the environment or use default
const API_URL = process.env.API_URL || 'https://api.genderize.io';

contextBridge.exposeInMainWorld('electron', {
  getApiUrl: async () => {
    try {
      // First try to get from main process
      const mainApiUrl = await ipcRenderer.invoke('get-api-url');
      return mainApiUrl || API_URL;
    } catch (error) {
      // Fallback to environment variable
      return API_URL;
    }
  }
}); 