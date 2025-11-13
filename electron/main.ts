import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase, closeDatabase } from './database/connection.js';
import { registerDatabaseHandlers } from './ipc/databaseHandlers.js';
import { registerHttpHandlers } from './ipc/httpHandlers.js';
import { registerFileHandlers } from './ipc/fileHandlers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  // Determine icon path based on environment
  const iconPath = process.env.VITE_DEV_SERVER_URL
    ? path.join(__dirname, '..', 'build', 'icon.ico')
    : path.join(process.resourcesPath, 'app.asar', 'build', 'icon.ico');

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'PostBoy',
    frame: false,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: false, // 允许加载本地资源
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function initializeApp() {
  try {
    initDatabase();
    registerDatabaseHandlers();
    registerHttpHandlers();
    registerFileHandlers();
  } catch (error) {
    console.error('Failed to initialize application:', error);
    app.quit();
  }
}

app.whenReady().then(() => {
  initializeApp();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('before-quit', () => {
  try {
    closeDatabase();
  } catch (error) {
    console.error('Error closing database:', error);
  }
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception in main process:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection in main process:', reason);
});
