import { app, BrowserWindow } from 'electron';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = !app.isPackaged;

let mainWindow;
let server;

async function startServer() {
  // 生产模式：数据文件存到 userData（asar 内不可写）
  if (!isDev) {
    const dataDir = app.getPath('userData');
    process.env.PICTUREME_DATA_DIR = dataDir;
    process.env.STATIC_DIR = path.join(__dirname, '..', 'dist');

    // 首次运行时自动创建 .env（不含 API Key，用户在应用内配置）
    const envPath = path.join(dataDir, '.env');
    if (!fs.existsSync(envPath)) {
      const jwtSecret = crypto.randomBytes(32).toString('hex');
      fs.writeFileSync(envPath, `PORT=3001\nJWT_SECRET=${jwtSecret}\n`, 'utf-8');
    }
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
