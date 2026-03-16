const { app, BrowserWindow, globalShortcut, screen, ipcMain } = require('electron');

let win;
let interactive = false;
let visible = true;

app.whenReady().then(() => {
  const { width, height } = screen.getPrimaryDisplay().bounds;

  win = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: __dirname + '/preload.cjs',
    },
  });

  win.loadURL('http://localhost:5173');

  // Start in click-through mode
  win.setIgnoreMouseEvents(true, { forward: true });

  // Allow renderer to toggle click-through per frame
  ipcMain.on('set-ignore-mouse', (_, ignore) => {
    win.setIgnoreMouseEvents(ignore, { forward: true });
  });

  // Alt+I — toggle interactive mode (lets you click on UI)
  globalShortcut.register('Alt+I', () => {
    interactive = !interactive;
    win.setIgnoreMouseEvents(!interactive, { forward: true });
  });

  // Alt+L — hide/show overlay
  globalShortcut.register('Alt+L', () => {
    visible = !visible;
    visible ? win.showInactive() : win.hide();
  });

  // Alt+Q — quit
  globalShortcut.register('Alt+Q', () => app.quit());
});

app.on('will-quit', () => globalShortcut.unregisterAll());
