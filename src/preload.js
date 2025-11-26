// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
// Source - https://stackoverflow.com/a
// Posted by Fabian , modified by community. See post 'Timeline' for change history
// Retrieved 2025-11-26, License - CC BY-SA 4.0
// Source - https://stackoverflow.com/a
// Posted by midnight-coding
// Retrieved 2025-11-26, License - CC BY-SA 4.0

// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Expose a function that calls the main process
  getData: () => ipcRenderer.invoke('get-data'),
});   