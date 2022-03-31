/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import fs from 'fs';
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { resolveHtmlPath } from './util';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.on('openJsonFile', async (_, arg) => {
  if (!mainWindow) {
    return;
  }

  let data;
  if (arg?.filePath) {
    data = fs.readFileSync(arg.filePath).toString();
  } else {
    data = dialog.showOpenDialogSync(mainWindow, {
      filters: [{ name: 'Data', extensions: ['json'] }],
    });
  }
  let res: any = data;
  if (Array.isArray(data)) {
    res = data?.map((item: string) => {
      return { path: item, data: fs.readFileSync(item).toString() };
    });
  } else {
    console.log(res);
    res = fs.readFileSync(res).toString();
  }
  mainWindow.webContents.send('openFile', { res, arg });
});

ipcMain.on('readJsonFile', async (event, arg) => {
  if (fs.existsSync(arg.path)) {
    const content = fs.readFileSync(arg.path).toString();
    event.reply('readJsonFile', { res: content, arg });
  } else {
    event.reply('readJsonFile', { res: null, arg });
  }
});

// ipcMain.on('writeJsonFile', async (event, arg) => {
//   fs.writeFileSync(arg.path, arg.data);
//   event.reply('writeFile', { arg, res: true });
// });

ipcMain.on('saveJsonFile', async (event, arg = {}) => {
  if (!mainWindow) {
    return;
  }
  let filePath = arg.path;
  if (!filePath) {
    filePath = dialog.showSaveDialogSync(mainWindow, {
      filters: [{ name: 'Data', extensions: ['json'] }],
    });
  }
  if (filePath) {
    fs.writeFileSync(filePath, arg.data);
    const data = {
      res: { filePath },
      arg,
    };
    event.reply('saveJsonFile', data);
  }
});

ipcMain.on('selectFolder', async (event) => {
  if (!mainWindow) {
    return;
  }
  const res = dialog.showOpenDialogSync(mainWindow, {
    properties: ['openDirectory'],
  });
  event.reply('selectFolder', res);
});

ipcMain.on('readFolder', async (event, arg = {}) => {
  if (!mainWindow) {
    return;
  }

  try {
    fs.accessSync(arg.path);
  } catch (err) {
    fs.mkdirSync(arg.path, { recursive: true });
  }
  const res = fs.readdirSync(arg.path);
  event.reply('readFolder', res);
});

ipcMain.on('deleteFolderFiles', async (event, arg = {}) => {
  if (!mainWindow) {
    return;
  }

  try {
    fs.accessSync(arg.path);
  } catch (err) {
    fs.mkdirSync(arg.path, { recursive: true });
  }
  const res = fs.readdirSync(arg.path);

  for (const resPath of res) {
    const filePath = `${arg.path}\\${resPath}`;
    fs.rmSync(filePath);
  }
  event.reply('deleteFolderFiles', res);
});

// ipcMain.on('saveJsonFileDialog', async (event, arg) => {
//   if (!mainWindow) {
//     return;
//   }
//   const path = dialog.showSaveDialogSync(mainWindow, {
//     filters: [{ name: 'Data', extensions: ['json'] }],
//   });
//   if (path) {
//     fs.writeFileSync(path, arg.data);
//     const data = {
//       res: { path },
//       arg,
//     };
//     event.reply('saveJsonFileDialog', data);
//     // mainWindow.webContents.send('saveJsonFileDialog', data);
//   }
// });

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDevelopment) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDevelopment) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
