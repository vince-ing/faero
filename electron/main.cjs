const { app, BrowserWindow, globalShortcut, screen, ipcMain } = require('electron');

let win;
let interactive = false;
let visible = true;

// WM_ACTIVATE = 0x0006
// Returning 0 tells Windows this window never "activates",
// which prevents the shell from dimming the taskbar beneath it.
const WM_ACTIVATE = 0x0006;

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
    focusable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: __dirname + '/preload.cjs',
    },
  });

  win.setAlwaysOnTop(true, 'screen-saver');
  win.setPosition(0, 0);
  win.setSize(width, height);

  // Intercept WM_ACTIVATE so Windows never considers this window "active"
  // This prevents the taskbar from entering its "covered" dim state
  win.hookWindowMessage(WM_ACTIVATE, () => {
    win.setEnabled(false);
    win.setEnabled(true);
  });

  win.loadURL('http://localhost:5173');
  win.setIgnoreMouseEvents(true, { forward: true });

  ipcMain.on('set-ignore-mouse', (_, ignore) => {
    win.setIgnoreMouseEvents(ignore, { forward: true });
  });

  globalShortcut.register('Alt+I', () => {
    interactive = !interactive;
    win.setIgnoreMouseEvents(!interactive, { forward: true });
  });

  globalShortcut.register('Alt+L', () => {
    visible = !visible;
    visible ? win.showInactive() : win.hide();
  });

  globalShortcut.register('Alt+Q', () => app.quit());
});

app.on('will-quit', () => globalShortcut.unregisterAll());
