const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openFile: () => ipcRenderer.invoke("dialog:openFile"),
  saveFile: (fileData) => ipcRenderer.invoke("dialog:saveFile", fileData),
});
