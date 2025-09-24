const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openFile: () => ipcRenderer.invoke("dialog:openFile"),
  saveFile: (fileData) => ipcRenderer.invoke("dialog:saveFile", fileData),

  // Window controls
  minimize: () => ipcRenderer.invoke("window:minimize"),
  maximize: () => ipcRenderer.invoke("window:maximize"),
  restore: () => ipcRenderer.invoke("window:restore"),
  close: () => ipcRenderer.invoke("window:close"),
  toggleFullscreen: () => ipcRenderer.invoke("window:toggleFullscreen"),
  isMaximized: () => ipcRenderer.invoke("window:isMaximized"),
  isFullscreen: () => ipcRenderer.invoke("window:isFullscreen"),
});
