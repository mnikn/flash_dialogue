const { contextBridge, ipcRenderer } = require('electron');

function generateUUID() {
  // Public Domain/MIT
  let d = new Date().getTime();
  if (
    typeof performance !== 'undefined' &&
    typeof performance.now === 'function'
  ) {
    d += performance.now(); // use high-precision timer if available
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

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
    loadImageFile(arg) {
      return new Promise((resolve) => {
        ipcRenderer.once('loadImageFile', (_, res) => {
          resolve(res);
        });
        ipcRenderer.send('loadImageFile', arg);
      });
    },
    close() {
      ipcRenderer.send('realClose');
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
    async call(command, arg) {
      const id = generateUUID();
      return new Promise((resolve) => {
        const handle = (_, res) => {
          if (res.arg.action === id) {
            resolve(res);
            ipcRenderer.off(command, handle);
          }
        };
        ipcRenderer.on(command, handle);
        ipcRenderer.send(command, { action: id, ...arg });
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
