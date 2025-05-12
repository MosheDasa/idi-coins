import { app, BrowserWindow, ipcMain, Menu, dialog, MenuItemConstructorOptions, globalShortcut, shell } from 'electron';
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
  apiUrl: process.env.API_URL || 'https://api.genderize.io',
  enableLogs: true,
  userId: process.env.USERID || '',
  representativeName: 'משה כהן',
  pollingInterval: 30,
  connected: false,
  devMode: false
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

function createMenu() {
  const template: MenuItemConstructorOptions[] = [
    {
      label: 'מידע',
      submenu: [
        {
          label: 'הגדרות',
          click: () => {
            if (aboutWindow) {
              aboutWindow.focus();
            } else {
              aboutWindow = createAboutWindow(mainWindow);
              aboutWindow.on('closed', () => {
                aboutWindow = null;
              });
            }
          }
        },
        { type: 'separator' },
        {
          label: 'יציאה',
          click: () => app.quit()
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC Handlers
ipcMain.handle('get-api-url', () => {
  writeLog('INFO', 'API URL requested', { url: settings.apiUrl });
  return settings.apiUrl || 'https://api.genderize.io';
});

ipcMain.handle('get-settings', () => {
  writeLog('INFO', 'Settings requested', { settings });
  return { 
    ...settings, 
    logsDirectory: settings.enableLogs ? getLogsDirectory() : '',
    configPath: settingsPath
  };
});

ipcMain.handle('minimize-window', () => {
  if (mainWindow) {
    writeLog('INFO', 'Window minimized');
    mainWindow.minimize();
  }
});

ipcMain.handle('close-window', () => {
  if (mainWindow) {
    writeLog('INFO', 'Window closed by user');
    mainWindow.close();
  }
});

ipcMain.handle('save-settings', async (event, newSettings) => {
  writeLog('INFO', 'Saving new settings', { newSettings });
  
  try {
    // Update settings object
    const oldSettings = { ...settings };
    settings = { 
      ...settings, 
      ...newSettings,
      // Preserve version from package.json
      version: app.getVersion()
    };
    
    // Save to file
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    writeLog('INFO', 'Settings saved successfully');
    
    // Reinitialize logger if logging setting changed
    if (oldSettings.enableLogs !== settings.enableLogs) {
      writeLog('INFO', 'Logging setting changed', { 
        oldValue: oldSettings.enableLogs, 
        newValue: settings.enableLogs 
      });
      initLogger(settings.enableLogs);
    }
    
    // Show restart dialog if critical settings changed
    if (oldSettings.apiUrl !== settings.apiUrl || 
        oldSettings.pollingInterval !== settings.pollingInterval) {
      const response = await dialog.showMessageBox({
        type: 'question',
        buttons: ['כן', 'לא'],
        defaultId: 0,
        title: 'נדרשת הפעלה מחדש',
        message: 'חלק מההגדרות דורשות הפעלה מחדש של האפליקציה. האם ברצונך להפעיל מחדש כעת?'
      });
      
      if (response.response === 0) {
        writeLog('INFO', 'User chose to restart application');
        app.relaunch();
        app.quit();
      }
    }
  } catch (error: any) {
    writeLog('ERROR', 'Failed to save settings', { error: error.message });
    throw error;
  }
});

// Add new handler for restarting the application
ipcMain.handle('restart-app', () => {
  writeLog('INFO', 'Restarting application after settings change');
  app.relaunch();
  app.quit();
});

ipcMain.handle('open-logs-directory', () => {
  const logsDir = getLogsDirectory();
  if (fs.existsSync(logsDir)) {
    shell.openPath(logsDir);
    writeLog('INFO', 'Logs directory opened by user');
  }
});

app.whenReady().then(() => {
  writeLog('INFO', 'Application ready');
  splashWindow = createSplashWindow();
  mainWindow = createMainWindow();
  
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

  // Register keyboard shortcut
  globalShortcut.register('CommandOrControl+Shift+Z', () => {
    writeLog('INFO', 'Settings shortcut triggered');
    if (aboutWindow) {
      aboutWindow.focus();
    } else {
      aboutWindow = createAboutWindow(mainWindow);
      aboutWindow.on('closed', () => {
        aboutWindow = null;
      });
    }
  });
});

app.on('will-quit', () => {
  writeLog('INFO', 'Application will quit');
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  writeLog('INFO', 'All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  writeLog('INFO', 'Application activated');
  if (BrowserWindow.getAllWindows().length === 0) {
    splashWindow = createSplashWindow();
    mainWindow = createMainWindow();
  }
}); 