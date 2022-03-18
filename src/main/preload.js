const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    myPing() {
      ipcRenderer.send('ipc-example', 'ping');
    },
    // saveJsonFile() {
    // },
    readJsonFile(arg) {
      return new Promise((resolve) => {
        ipcRenderer.once('readJsonFile', (_, res) => {
          // if (res.arg.action === arg.action) {
          //   if (callback) {
          //     callback(res);
          //   }
          //   resolve(res);
          // }
          resolve(res);
        });
        ipcRenderer.send('readJsonFile', arg);
      });
    },
    saveJsonFile(arg) {
      return new Promise((resolve) => {
        ipcRenderer.once('saveJsonFile', (_, res) => {
          // if (res.arg.action === arg.action) {
          //   if (callback) {
          //     callback(res);
          //   }
          //   resolve(res);
          // }
          resolve(res);
        });
        ipcRenderer.send('saveJsonFile', arg);
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
