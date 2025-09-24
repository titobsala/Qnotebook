const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const path = require("path");
const fs = require("fs");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    autoHideMenuBar: true, // Hide the native menu bar
  });

  win.loadURL("http://localhost:5174");
};

app.whenReady().then(() => {
  // Remove the native menu bar completely
  Menu.setApplicationMenu(null);

  // Handle a request to open a file
  ipcMain.handle("dialog:openFile", async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "Documents", extensions: ["md", "html", "txt"] }],
    });
    if (!canceled) {
      const filePath = filePaths[0];
      const content = fs.readFileSync(filePath, "utf-8");
      return { filePath, content };
    }
    return null;
  });

  // Handle a request to save a file
  ipcMain.handle("dialog:saveFile", async (event, { filePath, content }) => {
    // If no path, show save dialog (Save As...)
    let savePath = filePath;
    if (!savePath) {
      const { canceled, filePath: newFilePath } = await dialog.showSaveDialog({
        filters: [
          { name: "Markdown", extensions: ["md"] },
          { name: "HTML", extensions: ["html"] },
        ],
      });
      if (canceled) return null;
      savePath = newFilePath;
    }

    if (savePath) {
      fs.writeFileSync(savePath, content);
      return savePath;
    }
    return null;
  });

  // Window control handlers
  ipcMain.handle("window:minimize", () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) focusedWindow.minimize();
  });

  ipcMain.handle("window:maximize", () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) focusedWindow.maximize();
  });

  ipcMain.handle("window:restore", () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) focusedWindow.restore();
  });

  ipcMain.handle("window:close", () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) focusedWindow.close();
  });

  ipcMain.handle("window:toggleFullscreen", () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      const isFullScreen = focusedWindow.isFullScreen();
      focusedWindow.setFullScreen(!isFullScreen);
    }
  });

  ipcMain.handle("window:isMaximized", () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    return focusedWindow ? focusedWindow.isMaximized() : false;
  });

  ipcMain.handle("window:isFullscreen", () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    return focusedWindow ? focusedWindow.isFullScreen() : false;
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
