const { app, Tray, Menu, nativeImage, session } = require('electron');
const path = require('path');
const { createWindow, closeAll, getAllWindows } = require('./window');
const { registerIpc } = require('./ipc');
const pty = require('./pty');

const gotLock = app.requestSingleInstanceLock();

if (!gotLock) {
  app.quit();
} else {
  let tray = null;

  process.on('uncaughtException', (e) => {
    console.error('[beetroot] uncaught', e);
  });

  function openOrRestoreWindow() {
    const wins = getAllWindows();
    if (wins.length > 0) {
      const w = wins[0];
      if (w.isMinimized()) w.restore();
      w.show();
      w.focus();
      return;
    }
    const w = createWindow({ kind: 'native' });
    if (tray) { tray.destroy(); tray = null; }
    if (typeof global.__rebuildTrayMenu === 'function') global.__rebuildTrayMenu();
  }

  app.on('second-instance', () => {
    console.log('[APP] second-instance, restoring window');
    openOrRestoreWindow();
  });

  app.whenReady().then(() => {
    registerIpc();
    createWindow({ kind: 'native' });
  });

  app.on('window-all-closed', () => {
    const detached = pty.getDetachedSessions();
    console.log('[APP] window-all-closed, detached=', detached.length);
    if (detached.length > 0) {
      if (!tray) createTray();
      return;
    }
    closeAll();
    app.quit();
  });

  app.on('before-quit', () => {
    try { session.defaultSession.flushStorageData(); } catch {}
  });

  app.on('will-quit', () => {
    pty.killAll();
  });

  function createTray() {
    const iconPath = path.join(__dirname, '..', 'assets', 'icon.ico');
    let icon;
    try { icon = nativeImage.createFromPath(iconPath); } catch { icon = null; }
    if (!icon || icon.isEmpty()) icon = nativeImage.createEmpty();

    tray = new Tray(icon);
    tray.setToolTip('BEETROOT — background sessions');

    const rebuildMenu = () => {
      const sessions = pty.getDetachedSessions();
      const items = sessions.map((s) => ({
        label: s.title + '  (' + s.id.slice(0, 8) + ')',
        enabled: false
      }));
      const menu = Menu.buildFromTemplate([
        { label: 'Sessions: ' + sessions.length, enabled: false },
        { type: 'separator' },
        ...items,
        { type: 'separator' },
        { label: 'Open Window', click: openOrRestoreWindow },
        {
          label: 'Quit (kill all)',
          click: () => {
            pty.killAll();
            app.quit();
          }
        }
      ]);
      tray.setContextMenu(menu);
    };

    rebuildMenu();
    tray.on('double-click', openOrRestoreWindow);
    global.__rebuildTrayMenu = rebuildMenu;
  }
}