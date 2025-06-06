import { BrowserWindow, app } from 'electron';
import * as path from 'path';
import { writeLog } from '../utils/logger';


export function createMainWindow(devMode: boolean = false): BrowserWindow {
  writeLog('INFO', 'Creating main window', { source: 'SERVER' });
  
  const mainWindow = new BrowserWindow({
    width: 500,
    height: 350,
    icon: path.join(app.getAppPath(), 'public/icon.ico'),
    resizable: false,
    frame: false,
    show: false,
    backgroundColor: '#ffffff',
    transparent: false,
    minimizable: true,
    maximizable: false,
    fullscreenable: false,
    closable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(app.getAppPath(), 'dist/preload.js')
    }
  });

  mainWindow.loadFile(path.join(app.getAppPath(), 'dist/index.html'));
  
  // Remove menu
  mainWindow.removeMenu();
  
  mainWindow.webContents.on('did-finish-load', () => {
    writeLog('INFO', 'Main window loaded', { source: 'SERVER' });
    if (devMode) {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  });

  mainWindow.on('closed', () => {
    writeLog('INFO', 'Main window closed', { source: 'SERVER' });
  });

  return mainWindow;
} 