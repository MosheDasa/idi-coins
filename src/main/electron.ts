import { app, BrowserWindow, ipcMain, Menu, dialog, MenuItemConstructorOptions, globalShortcut } from 'electron';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

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
  if (aboutWindow) {
    aboutWindow.focus();
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
    aboutWindow = null;
  });

  // Remove the menu from the about window
  aboutWindow.removeMenu();
}

function createSplashWindow() {
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

// IPC Handlers
ipcMain.handle('get-api-url', () => {
  if (settings.enableLogs) {
    console.log('Renderer requested API URL, returning:', settings.apiUrl);
  }
  return settings.apiUrl || 'https://api.genderize.io';
});

ipcMain.handle('get-settings', () => settings);

ipcMain.handle('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('close-window', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.handle('save-settings', async (event, newSettings) => {
  // Update settings object
  settings = { 
    ...settings, 
    ...newSettings,
    // Preserve version from package.json
    version: app.getVersion()
  };
  
  // Save to file
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    
    // Show restart dialog
    const response = await dialog.showMessageBox({
      type: 'question',
      buttons: ['כן', 'לא'],
      defaultId: 0,
      title: 'נדרשת הפעלה מחדש',
      message: 'חלק מההגדרות דורשות הפעלה מחדש של האפליקציה. האם ברצונך להפעיל מחדש כעת?'
    });
    
    if (response.response === 0) {
      app.relaunch();
      app.quit();
    }
  } catch (err) {
    console.error('Error saving settings:', err);
    throw err;
  }
});

app.whenReady().then(() => {
  createSplashWindow();
  createMainWindow();
  
  // Register keyboard shortcut
  globalShortcut.register('CommandOrControl+Shift+Z', () => {
    createAboutWindow();
  });
});

// Add cleanup for shortcuts
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
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