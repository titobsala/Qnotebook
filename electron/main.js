const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { readFile, writeFile } = require('fs').promises;
const http = require('http');
const fs = require('fs');

const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let localServer;

// Simple static file server for production builds
function createLocalServer() {
  const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, '../dist', req.url === '/' ? 'index.html' : req.url);

    // Security: prevent directory traversal
    if (!filePath.startsWith(path.join(__dirname, '../dist'))) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      const ext = path.extname(filePath);
      const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml'
      };

      const contentType = mimeTypes[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });

  server.listen(0, () => { // Use port 0 for random available port
    const port = server.address().port;
    console.log(`Local server running on port ${port}`);
    localServer = { server, port };
  });

  return new Promise((resolve) => {
    server.on('listening', () => resolve(server));
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png'), // Optional: add app icon
    titleBarStyle: 'default',
    show: false // Don't show until ready
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5174');
    mainWindow.webContents.openDevTools(); // Open DevTools in development
  } else {
    // Start local server and load from it
    await createLocalServer();
    mainWindow.loadURL(`http://localhost:${localServer.port}`);
  }

  // Debug: Log when page is loaded
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page loaded successfully');
  });

  // Debug: Log any console messages from renderer
  mainWindow.webContents.on('console-message', (event, level, message) => {
    console.log(`Renderer Console [${level}]:`, message);
  });

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    // Close local server when window closes
    if (localServer && localServer.server) {
      localServer.server.close();
    }
    mainWindow = null;
  });
}

// App event handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// File dialog handlers
ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Text Files', extensions: ['txt', 'md', 'html'] },
      { name: 'Markdown Files', extensions: ['md'] },
      { name: 'HTML Files', extensions: ['html'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    try {
      const filePath = result.filePaths[0];
      const content = await readFile(filePath, 'utf8');
      const extension = path.extname(filePath).toLowerCase();

      return {
        success: true,
        filePath,
        content,
        extension
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  return { success: false, canceled: true };
});

ipcMain.handle('dialog:saveFile', async (event, fileData) => {
  const { content, suggestedName, format } = fileData;

  const extensions = {
    'markdown': ['md'],
    'html': ['html'],
    'text': ['txt']
  };

  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: suggestedName || 'document',
    filters: [
      { name: 'Markdown Files', extensions: ['md'] },
      { name: 'HTML Files', extensions: ['html'] },
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (!result.canceled) {
    try {
      await writeFile(result.filePath, content, 'utf8');
      return {
        success: true,
        filePath: result.filePath
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  return { success: false, canceled: true };
});

// Window control handlers
ipcMain.handle('window:minimize', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('window:maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.restore();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('window:restore', () => {
  if (mainWindow) {
    mainWindow.restore();
  }
});

ipcMain.handle('window:close', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.handle('window:toggleFullscreen', () => {
  if (mainWindow) {
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
  }
});

ipcMain.handle('window:isMaximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

ipcMain.handle('window:isFullscreen', () => {
  return mainWindow ? mainWindow.isFullScreen() : false;
});