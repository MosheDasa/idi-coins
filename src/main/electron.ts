import { app, BrowserWindow, ipcMain, shell, globalShortcut } from 'electron';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { initLogger, writeLog, getLogsDirectory } from './utils/logger';
import { createMainWindow } from './windows/mainWindow';
import { createSplashWindow } from './windows/splashWindow';
import { createAboutWindow } from './windows/aboutWindow';

// Load environment variables from .env file
dotenv.config();

// Settings management
let settings = {
  version: app.getVersion(),
  environment: process.env.NODE_ENV || 'development',
  enableLogs: true,
  userId: process.env.USERID || '',
  representativeName: 'משה כהן',
  connected: false,
  devMode: false,
  apiUrl: process.env.API_URL || '',
  apiRefreshInterval: Number(process.env.API_REFRESH_INTERVAL) || 30
};

// Try to load settings from file
const settingsPath = path.join(app.getPath('userData'), 'settings.json');
try {
  if (fs.existsSync(settingsPath)) {
    const savedSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    settings = { ...settings, ...savedSettings };
  }
} catch (err) {
  console.error('Error loading settings:', err);
}

// Initialize logger with settings
initLogger(settings.enableLogs);

let mainWindow: BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;
let aboutWindow: BrowserWindow | null = null;

// IPC Handlers
ipcMain.handle('get-settings', () => {
  writeLog('INFO', 'Settings requested', { settings, source: 'SERVER' });
  return {
    ...settings,
    logsDirectory: settings.enableLogs ? getLogsDirectory() : '',
    configPath: settingsPath
  };
});

ipcMain.handle('minimize-window', () => {
  if (mainWindow) {
    writeLog('INFO', 'Window minimized', { source: 'SERVER' });
    mainWindow.minimize();
  }
});

ipcMain.handle('close-window', () => {
  if (mainWindow) {
    writeLog('INFO', 'Window closed by user', { source: 'SERVER' });
    mainWindow.close();
  }
});

ipcMain.handle('save-settings', async (event, newSettings) => {
  writeLog('INFO', 'Saving new settings', { newSettings, source: 'SERVER' });
  try {
    const oldSettings = { ...settings };
    settings = {
      ...settings,
      ...newSettings,
      version: app.getVersion()
    };
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    writeLog('INFO', 'Settings saved successfully', { source: 'SERVER' });
    
    // Handle logging changes
    if (oldSettings.enableLogs !== settings.enableLogs) {
      writeLog('INFO', 'Logging setting changed', {
        oldValue: oldSettings.enableLogs,
        newValue: settings.enableLogs,
        source: 'SERVER'
      });
      initLogger(settings.enableLogs);
    }

    // Handle DevTools changes
    if (oldSettings.devMode !== settings.devMode) {
      writeLog('INFO', 'Developer mode changed', {
        oldValue: oldSettings.devMode,
        newValue: settings.devMode,
        source: 'SERVER'
      });
      
      // Update DevTools for main window
      if (mainWindow) {
        if (settings.devMode) {
          mainWindow.webContents.openDevTools({ mode: 'detach' });
        } else {
          mainWindow.webContents.closeDevTools();
        }
      }
    }
  } catch (error: any) {
    writeLog('ERROR', 'Failed to save settings', { error: error.message, source: 'SERVER' });
    throw error;
  }
});

ipcMain.handle('restart-app', () => {
  writeLog('INFO', 'Restarting application after settings change', { source: 'SERVER' });
  app.relaunch();
  app.quit();
});

ipcMain.handle('open-logs-directory', () => {
  const logsDir = getLogsDirectory();
  if (fs.existsSync(logsDir)) {
    shell.openPath(logsDir);
    writeLog('INFO', 'Logs directory opened by user', { source: 'SERVER' });
  }
});

ipcMain.handle('write-log', (event, level, message, data) => {
  writeLog(level, message, data);
});

// Function to open settings window
function openSettingsWindow() {
  if (aboutWindow) {
    aboutWindow.focus();
    return;
  }
  aboutWindow = createAboutWindow(mainWindow, settings.devMode);
  aboutWindow.on('closed', () => {
    aboutWindow = null;
  });
}

// Register global shortcut
app.whenReady().then(() => {
  writeLog('INFO', 'Application ready', { source: 'SERVER' });
  splashWindow = createSplashWindow();
  mainWindow = createMainWindow(settings.devMode);
  
  // Register the global shortcut
  globalShortcut.register('CommandOrControl+Shift+Z', () => {
    writeLog('INFO', 'Settings shortcut triggered', { source: 'SERVER' });
    openSettingsWindow();
  });
  
  // Show main window when loaded
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
});

// Clean up shortcuts when app quits
app.on('will-quit', () => {
  writeLog('INFO', 'Application will quit', { source: 'SERVER' });
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  writeLog('INFO', 'All windows closed', { source: 'SERVER' });
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  writeLog('INFO', 'Application activated', { source: 'SERVER' });
  if (BrowserWindow.getAllWindows().length === 0) {
    splashWindow = createSplashWindow();
    mainWindow = createMainWindow(settings.devMode);
    // Open settings window if needed
    // aboutWindow = createAboutWindow(mainWindow, settings.devMode); // Only if you want to auto-open
  }
}); 