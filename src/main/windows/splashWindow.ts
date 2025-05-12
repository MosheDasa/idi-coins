import { BrowserWindow, app } from 'electron';
import * as path from 'path';
import { writeLog } from '../utils/logger';

export function createSplashWindow(): BrowserWindow {
  writeLog('INFO', 'Creating splash window', { source: 'SERVER' });
  
  const splashWindow = new BrowserWindow({
    width: 500,
    height: 350,
    frame: false,
    transparent: true,
    backgroundColor: '#00ffffff',
    show: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(app.getAppPath(), 'dist/preload.js')
    }
  });

  splashWindow.loadFile(path.join(app.getAppPath(), 'dist/splash.html'));

  return splashWindow;
} 