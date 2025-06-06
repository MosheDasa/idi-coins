import { BrowserWindow, app } from 'electron';
import * as path from 'path';
import { writeLog } from '../utils/logger';

export function createAboutWindow(parentWindow: BrowserWindow | null = null, devMode: boolean = false): BrowserWindow {
  writeLog('INFO', 'Opening settings window', { source: 'SERVER' });
  
  const aboutWindow = new BrowserWindow({
    width: 520,
    height: 640,
    resizable: false,
    minimizable: false,
    maximizable: false,
    parent: parentWindow || undefined,
    modal: true,
    useContentSize: true,
    backgroundColor: '#ffffff',
    transparent: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true
    }
  });

  aboutWindow.loadFile(path.join(app.getAppPath(), 'dist/about.html'));

  // Open DevTools if developer mode is enabled
  if (devMode) {
    aboutWindow.webContents.openDevTools({ mode: 'detach' });
  }

  aboutWindow.on('closed', () => {
    writeLog('INFO', 'Settings window closed', { source: 'SERVER' });
  });

  aboutWindow.removeMenu();

  return aboutWindow;
} 