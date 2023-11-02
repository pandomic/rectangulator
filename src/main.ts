import * as path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import isDev from 'electron-is-dev';

import { optimizeModel, encodeModel } from '@/models/solvers';
import { LPNewModel } from "@/types";

const STATE: {
  window: BrowserWindow | null,
  isQuiting: boolean
} = {
  window: null,
  isQuiting: false,
};

const createWindow = async () => {
  STATE.window = new BrowserWindow({
    width: isDev ? 1400 : 1000,
    height: 800,
    icon: path.join(app.getAppPath(), 'dist', 'favicon.png'),
    webPreferences: {
      preload: path.join(app.getAppPath(), 'dist', 'preload.js'),
    },
  });

  STATE.window.loadURL(`file://${path.join(app.getAppPath(), 'dist', 'index.html')}`);
  STATE.window.setBackgroundColor('#ffffff');

  if (isDev) {
    STATE.window.webContents.openDevTools();
  }

  STATE.window.on('close', (event) => {
    event.preventDefault();
  });

  STATE.window.webContents.on('will-navigate', (event, url) => {
    event.preventDefault(); // Prevent the default behavior of opening the link in a new tab
    shell.openExternal(url);
  });

  STATE.window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  STATE.window.show();
};

const createApp = () => {
  createWindow();
};

app.whenReady().then(createApp);

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('optimizeMIPModel', async (_event, model: LPNewModel) => {
  return optimizeModel('highs', model);
});

ipcMain.handle('encodeMIPModel', async (_event, model: LPNewModel) => {
  return encodeModel('highs', model);
});
