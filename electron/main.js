import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = !app.isPackaged;

let mainWindow;
let server;

async function startServer() {
  // 生产模式：数据文件存到 userData（asar 内不可写）
  if (!isDev) {
    process.env.PICTUREME_DATA_DIR = app.getPath('userData');
    process.env.STATIC_DIR = path.join(__dirname, '..', 'dist');
  }
  process.env.PORT = '3001';

  // 直接在主进程内启动 Express（避免 fork 在打包后找不到 Node）
  const serverModule = await import(
    path.join(__dirname, '..', 'server', 'index.js')
  );
  server = serverModule.server;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL('http://localhost:3001');
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  await startServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (server) {
    server.close();
    server = null;
  }
});
