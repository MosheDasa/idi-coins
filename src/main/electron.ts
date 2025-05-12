import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Get API URL from .env
const API_URL = process.env.API_URL;
console.log('Loading with API URL:', API_URL);

if (!API_URL) {
  console.error('Warning: API_URL is not set in .env file');
}

let mainWindow: BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 500,
    height: 350,
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  splashWindow.loadFile(path.join(__dirname, 'splash.html'));
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 350,
    icon: path.join(__dirname, '../public/icon.ico'),
    resizable: false,
    frame: true,
    show: true,
    transparent: true,
    minimizable: true,
    maximizable: false,
    fullscreenable: false,
    closable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Set up IPC handler for API URL
  ipcMain.handle('get-api-url', () => {
    console.log('Renderer requested API URL, returning:', API_URL);
    if (!API_URL) {
      throw new Error('API_URL is not configured in .env file');
    }
    return API_URL;
  });

  mainWindow.removeMenu();

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  
  mainWindow.webContents.on('did-finish-load', () => {
    setTimeout(() => {
      if (splashWindow) {
        splashWindow.close();
        splashWindow = null;
      }
      if (mainWindow) {
        mainWindow.show();
      }
    }, 1000);
  });
}

app.whenReady().then(() => {
  createSplashWindow();
  createMainWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createSplashWindow();
    createMainWindow();
  }
}); 