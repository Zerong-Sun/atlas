const { app, BrowserWindow, Menu, protocol, session, shell, dialog } = require('electron');
const path = require('node:path');
const { createHandler, isAppUrl, ORIGIN } = require('./protocol.cjs');
const { handleLlmProxy } = require('./llm-proxy.cjs');

protocol.registerSchemesAsPrivileged([{ scheme: 'atlas', privileges: {
  standard: true, secure: true, supportFetchAPI: true, corsEnabled: true,
} }]);
app.setName('诸象 Atlas');
// A permanent origin and profile keep settings, notes and readings across releases.
app.setPath('userData', path.join(app.getPath('appData'), 'ZhuxiangAtlas'));

function openExternal(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:' && !parsed.username && !parsed.password) {
      shell.openExternal(url).catch(() => {});
    }
  } catch { /* Ignore unsupported links. */ }
}

function createWindow() {
  const win = new BrowserWindow({
    title: '诸象 Atlas', width: 1240, height: 840, minWidth: 390, minHeight: 640,
    backgroundColor: '#0B1020', show: false,
    webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true },
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event, url) => {
    if (!isAppUrl(url)) { event.preventDefault(); openExternal(url); }
  });
  win.webContents.on('will-redirect', (event, url) => {
    if (!isAppUrl(url)) event.preventDefault();
  });
  win.once('ready-to-show', () => win.show());
  win.loadURL(ORIGIN + '/').catch((error) => {
    dialog.showErrorBox('诸象 Atlas 启动失败', error.message);
  });
  return win;
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
  });
  app.whenReady().then(() => {
    protocol.handle('atlas', createHandler(path.join(__dirname, 'web'), handleLlmProxy));
    session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
    session.defaultSession.setPermissionCheckHandler(() => false);
    const menu = [
      ...(process.platform === 'darwin' ? [{ label: '诸象 Atlas', submenu: [{ role: 'about' }, { type: 'separator' }, { role: 'hide' }, { role: 'quit' }] }] : []),
      { label: '编辑', submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' }, { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }] },
      { label: '显示', submenu: [{ role: 'reload' }, { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { role: 'togglefullscreen' }] },
      { label: '帮助', submenu: [{ label: '下载与版本说明', click: () => openExternal('https://github.com/Zerong-Sun/atlas/releases/tag/atlas-v0.2.1') }] },
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
    createWindow();
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
  }).catch((error) => { dialog.showErrorBox('诸象 Atlas 启动失败', error.message); app.quit(); });
}
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
