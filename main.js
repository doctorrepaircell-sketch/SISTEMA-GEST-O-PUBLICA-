
const { app, BrowserWindow, screen, globalShortcut } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: Math.floor(width * 0.95),
    height: Math.floor(height * 0.95),
    minWidth: 1024,
    minHeight: 768,
    backgroundColor: '#F8FAFC',
    title: "SISTEMA DE GESTÃO PÚBLICA",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      spellcheck: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Remove menu padrão
  mainWindow.removeMenu();

  // Se o app falhar ao carregar o conteúdo em 5 segundos, abre o console para debug
  mainWindow.webContents.on('did-fail-load', () => {
    mainWindow.webContents.openDevTools();
  });

  globalShortcut.register('F12', () => {
    mainWindow.webContents.toggleDevTools();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
  app.whenReady().then(createWindow);
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
