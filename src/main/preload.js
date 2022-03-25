const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    myPing() {
      ipcRenderer.send('ipc-example', 'ping');
    },
    readJsonFile(arg) {
      return new Promise((resolve) => {
        ipcRenderer.once('readJsonFile', (_, res) => {
          resolve(res);
        });
        ipcRenderer.send('readJsonFile', arg);
      });
    },
    saveJsonFile(arg) {
      return new Promise((resolve) => {
        ipcRenderer.once('saveJsonFile', (_, res) => {
          resolve(res);
        });
        ipcRenderer.send('saveJsonFile', arg);
      });
    },
    selectFolder(arg) {
      return new Promise((resolve) => {
        ipcRenderer.once('selectFolder', (_, res) => {
          resolve(res);
        });
        ipcRenderer.send('selectFolder', arg);
      });
    },
    readFolder(arg) {
      return new Promise((resolve) => {
        ipcRenderer.once('readFolder', (_, res) => {
          resolve(res);
        });
        ipcRenderer.send('readFolder', arg);
      });
    },
    deleteFolderFiles(arg) {
      return new Promise((resolve) => {
        ipcRenderer.once('deleteFolderFiles', (_, res) => {
          resolve(res);
        });
        ipcRenderer.send('deleteFolderFiles', arg);
      });
    },
    on(channel, func) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
    once(channel, func) {
      ipcRenderer.once(channel, (event, ...args) => func(...args));
    },
    off(channel, func) {
      ipcRenderer.removeListener(channel, func);
    },
    removeAllListeners(channel) {
      ipcRenderer.removeAllListeners(channel);
    },
  },
});
