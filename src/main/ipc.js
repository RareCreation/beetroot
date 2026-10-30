const { ipcMain, screen } = require('electron');
const win = require('./window');
const pty = require('./pty');
const clip = require('./clipboard');

let dragTimer = null;
let dragSourceWin = null;
let dragGhostSize = { width: 160, height: 26 };
let dragStartPoint = { x: 0, y: 0 };

function refreshTray() {
    if (typeof global.__rebuildTrayMenu === 'function') {
        try { global.__rebuildTrayMenu(); } catch (e) { console.warn('[IPC] tray rebuild failed', e); }
    }
}

function registerIpc() {
    ipcMain.on('pty:create', (_, { id, cols, rows }) => {
        console.log('[IPC] pty:create', id, cols, rows);
        pty.create(id, cols, rows);
    });
    ipcMain.on('pty:kill', (_, id) => {
        console.log('[IPC] pty:kill', id);
        pty.kill(id);
        refreshTray();
    });
    ipcMain.on('pty:input', (_, { id, data }) => pty.input(id, data));
    ipcMain.on('pty:resize-active', (_, { cols, rows }) => pty.resizeActive(cols, rows));
    ipcMain.handle('pty:exists', (_, id) => pty.exists(id));

    ipcMain.on('pty:reattach', (event, { id }) => {
        const target = win.findWindowByWebContentsId(event.sender.id);
        if (target) {
            pty.setTargetWindow(id, target);
            pty.reattach(id);
        }
    });

    ipcMain.handle('pty:detach', (_, id, title) => {
        console.log('[IPC] pty:detach', id, title);
        const r = pty.detach(id, title);
        console.log('[IPC] pty:detach result', r);
        refreshTray();
        return r;
    });
    ipcMain.handle('pty:get-detached', () => {
        return pty.getDetachedSessions();
    });

    ipcMain.handle('pty:attach', (event, id) => {
        console.log('[IPC] pty:attach', id);
        const target = win.findWindowByWebContentsId(event.sender.id);
        let r = false;
        if (target) r = pty.attach(id, target);
        console.log('[IPC] pty:attach result', r);
        refreshTray();
        return r;
    });

    ipcMain.on('drag:start', (event, { width, height, title }) => {
        dragSourceWin = win.findWindowByWebContentsId(event.sender.id);
        dragGhostSize = { width: Math.max(80, width || 160), height: Math.max(20, height || 26) };

        if (dragTimer) { clearInterval(dragTimer); dragTimer = null; }
        win.destroyGhost();

        const pt = screen.getCursorScreenPoint();
        dragStartPoint = { x: pt.x, y: pt.y };

        const gw = win.createGhostWindow({
            x: Math.round(pt.x - dragGhostSize.width / 2),
            y: Math.round(pt.y - dragGhostSize.height / 2),
            width: dragGhostSize.width,
            height: dragGhostSize.height,
            title: title || 'Terminal'
        });

        gw.webContents.once('did-finish-load', () => {
            win.sendToWindow(gw, 'ghost:update', {
                title: title || 'Terminal',
                targetId: null,
                rotate: 0,
                scale: 1.06
            });
            win.showGhost();
        });

        dragTimer = setInterval(() => {
            if (!dragSourceWin || dragSourceWin.isDestroyed()) return;
            const p = screen.getCursorScreenPoint();
            const target = win.findWindowAtPoint(p.x, p.y, dragSourceWin);

            const dx = p.x - dragStartPoint.x;
            const dy = p.y - dragStartPoint.y;
            const rotate = Math.max(-12, Math.min(12, dx * 0.04));
            const scale = target ? 1.15 : (Math.abs(dy) > 40 ? 1.12 : 1.06);

            win.updateGhost({
                x: Math.round(p.x - dragGhostSize.width / 2),
                y: Math.round(p.y - dragGhostSize.height / 2),
                width: dragGhostSize.width,
                height: dragGhostSize.height
            });

            win.sendToWindow(gw, 'ghost:update', {
                title: title || 'Terminal',
                targetId: target ? target.webContents.id : null,
                rotate,
                scale
            });

            win.sendToWindow(dragSourceWin, 'drag:hover', {
                targetId: target ? target.webContents.id : null,
                x: p.x,
                y: p.y
            });
        }, 16);
    });

    ipcMain.on('drag:end', () => {
        if (dragTimer) { clearInterval(dragTimer); dragTimer = null; }
        dragSourceWin = null;
        win.destroyGhost();
    });

    ipcMain.on('window:new-artificial-with-pty', (event, { ptyId, title, bounds }) => {
        const newWin = win.createWindow({
            kind: 'artificial',
            width: bounds?.width || 1000,
            height: bounds?.height || 640,
            x: bounds?.x,
            y: bounds?.y,
            init: { ptyId, title }
        });
        pty.setTargetWindow(ptyId, newWin);
    });

    ipcMain.on('pty:transfer', (event, { ptyId, title, targetWebContentsId }) => {
        const target = win.getAllWindows().find(w => w.webContents.id === targetWebContentsId);
        if (!target) return;
        pty.setTargetWindow(ptyId, target);
        win.sendToWindow(target, 'pty:adopt', { ptyId, title });
    });

    ipcMain.handle('clip:read', () => clip.read());
    ipcMain.on('clip:write', (_, t) => clip.write(t));

    ipcMain.on('win:min', (event) => {
        const bw = win.findWindowByWebContentsId(event.sender.id);
        if (bw) win.minimize(bw);
    });
    ipcMain.on('win:max', (event) => {
        const bw = win.findWindowByWebContentsId(event.sender.id);
        if (bw) win.toggleMax(bw);
    });
    ipcMain.on('win:close', (event) => {
        const bw = win.findWindowByWebContentsId(event.sender.id);
        if (bw) win.close(bw);
    });
    ipcMain.handle('win:getBounds', (event) => {
        const bw = win.findWindowByWebContentsId(event.sender.id);
        return win.getBounds(bw);
    });
    ipcMain.on('win:setBounds', (event, b) => {
        const bw = win.findWindowByWebContentsId(event.sender.id);
        if (bw) win.setBounds(b, bw);
    });
    ipcMain.handle('win:pin', (event) => {
        const bw = win.findWindowByWebContentsId(event.sender.id);
        if (!bw) return false;
        bw.setAlwaysOnTop(!bw.isAlwaysOnTop());
        return bw.isAlwaysOnTop();
    });
}

module.exports = { registerIpc };