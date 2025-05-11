import { app, BrowserWindow } from 'electron';
import * as path from 'path';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 500,
    height: 350,
    icon: path.join(__dirname, '../public/icon.ico'),
    resizable: false,
    frame: true,
    show: true,
    minimizable: true,
    maximizable: false,
    fullscreenable: false,
    closable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  });

  mainWindow.removeMenu();

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  
  if (process.env.NODE_ENV === 'development') {
   //  mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
}); 