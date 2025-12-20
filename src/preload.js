const { contextBridge, ipcRenderer } = require('electron')
var events;

contextBridge.exposeInMainWorld('data', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRenderer.invoke('ping')
  // we can also expose variables, not ju
  // st functions
})
contextBridge.exposeInMainWorld('calendar',{
  getEvents: (data) => ipcRenderer.invoke('events',data),
  create:(data)=>ipcRenderer.invoke('createAppointment',data),
})