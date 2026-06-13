// electron/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('jarbai', {
  // Open a native folder dialog
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  // Platform info
  platform: process.platform,
  // App version
  version: process.env.npm_package_version || '1.0.0',
});
