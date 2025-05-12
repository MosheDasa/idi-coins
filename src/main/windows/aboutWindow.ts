import { BrowserWindow, app } from 'electron';
import * as path from 'path';
import { writeLog } from '../utils/logger';

export function createAboutWindow(parentWindow: BrowserWindow | null = null): BrowserWindow {
  writeLog('INFO', 'Opening settings window');
  
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
      contextIsolation: false
    }
  });

  aboutWindow.loadFile(path.join(app.getAppPath(), 'dist/about.html'));

  aboutWindow.on('closed', () => {
    writeLog('INFO', 'Settings window closed');
  });

  aboutWindow.removeMenu();

  return aboutWindow;
} 