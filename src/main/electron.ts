import { app, BrowserWindow, ipcMain, Menu, dialog, MenuItemConstructorOptions, globalShortcut, shell } from 'electron';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { initLogger, writeLog, getLogsDirectory } from './logger';

// Load environment variables from .env file
dotenv.config();

// Settings management
let settings = {
  version: app.getVersion(),
  environment: process.env.NODE_ENV || 'development',
  apiUrl: process.env.API_URL || 'https://api.genderize.io',
  enableLogs: true
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
          click: createAboutWindow
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

function createAboutWindow() {
  writeLog('INFO', 'Opening settings window');
  
  if (aboutWindow) {
    aboutWindow.focus();
    writeLog('INFO', 'Settings window focused (already open)');
    return;
  }

  aboutWindow = new BrowserWindow({
    width: 520,
    height: 450,
    resizable: false,
    minimizable: false,
    maximizable: false,
    parent: mainWindow || undefined,
    modal: true,
    useContentSize: true,
    backgroundColor: '#f5f5f5',
    transparent: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  aboutWindow.loadFile(path.join(__dirname, 'about.html'));

  aboutWindow.on('closed', () => {
    writeLog('INFO', 'Settings window closed');
    aboutWindow = null;
  });

  aboutWindow.removeMenu();
}

function createSplashWindow() {
  writeLog('INFO', 'Creating splash window');
  
  splashWindow = new BrowserWindow({
    width: 500,
    height: 350,
    frame: false,
    transparent: true,
    backgroundColor: '#00ffffff',
    show: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  splashWindow.loadFile(path.join(__dirname, 'splash.html'));
}

function createMainWindow() {
  writeLog('INFO', 'Creating main window');
  
  mainWindow = new BrowserWindow({
    width: 500,
    height: 350,
    icon: path.join(__dirname, '../public/icon.ico'),
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
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  
  // Remove menu
  mainWindow.removeMenu();
  
  mainWindow.webContents.on('did-finish-load', () => {
    writeLog('INFO', 'Main window loaded');
    setTimeout(() => {
      if (splashWindow) {
        splashWindow.close();
        splashWindow = null;
        writeLog('INFO', 'Splash window closed');
      }
      if (mainWindow) {
        mainWindow.show();
        writeLog('INFO', 'Main window shown');
      }
    }, 1000);
  });

  mainWindow.on('closed', () => {
    writeLog('INFO', 'Main window closed');
    mainWindow = null;
  });
}

// IPC Handlers
ipcMain.handle('get-api-url', () => {
  writeLog('INFO', 'API URL requested', { url: settings.apiUrl });
  return settings.apiUrl || 'https://api.genderize.io';
});

ipcMain.handle('get-settings', () => {
  writeLog('INFO', 'Settings requested', { settings });
  const logsDir = settings.enableLogs ? getLogsDirectory() : '';
  return { ...settings, logsDirectory: logsDir };
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
    
    // Show restart dialog
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
  } catch (error: any) {
    writeLog('ERROR', 'Failed to save settings', { error: error.message });
    throw error;
  }
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
  createSplashWindow();
  createMainWindow();
  
  // Register keyboard shortcut
  globalShortcut.register('CommandOrControl+Shift+Z', () => {
    writeLog('INFO', 'Settings shortcut triggered');
    createAboutWindow();
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
    createSplashWindow();
    createMainWindow();
  }
}); 