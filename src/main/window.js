const { BrowserWindow, screen } = require('electron');
const path = require('path');

let windows = [];
let ghostWin = null;
const windowKind = new Map();
const maximizedMap = new Map();
const prevBoundsMap = new Map();

const GHOST_PAD = 24;

const send = (win, ch, ...a) => {
    if (win && !win.isDestroyed()) win.webContents.send(ch, ...a);
};

function createWindow(options = {}) {
    const kind = options.kind === 'artificial' ? 'artificial' : 'native';
    const win = new BrowserWindow({
        width: options.width || 1000,
        height: options.height || 640,
        x: options.x,
        y: options.y,
        minWidth: 480,
        minHeight: 300,
        frame: false,
        transparent: true,
        hasShadow: false,
        backgroundColor: '#00000000',
        icon: path.join(__dirname, '..', 'assets', 'icon.ico'),
        show: false,
        webPreferences: {
            preload: path.join(__dirname, '..', 'preload', 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.setMenu(null);
    win.loadFile(path.join(__dirname, '..', 'assets', 'index.html'));

    windowKind.set(win, kind);
    win.once('ready-to-show', () => win.show());

    win.webContents.once('did-finish-load', () => {
        win.webContents.focus();
        send(win, 'window:kind', { kind });
        if (options.init) send(win, 'window:init', options.init);
    });

    win.webContents.on('before-input-event', (e, input) => {
        const isDev = input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i');
        if (input.type === 'keyDown' && isDev) {
            if (win.webContents.isDevToolsOpened()) win.webContents.closeDevTools();
            else win.webContents.openDevTools({ mode: 'detach' });
        }
    });

    win.on('closed', () => {
        windows = windows.filter(w => w !== win);
        windowKind.delete(win);
        maximizedMap.delete(win);
        prevBoundsMap.delete(win);
    });

    windows.push(win);
    return win;
}

function createGhostWindow(opts) {
    const contentW = opts.width || 160;
    const contentH = opts.height || 26;
    const x = opts.x || 0;
    const y = opts.y || 0;
    const width = contentW + GHOST_PAD * 2;
    const height = contentH + GHOST_PAD * 2;

    if (ghostWin && !ghostWin.isDestroyed()) {
        ghostWin.setBounds({ x: x - GHOST_PAD, y: y - GHOST_PAD, width, height });
        return ghostWin;
    }

    ghostWin = new BrowserWindow({
        width,
        height,
        x: x - GHOST_PAD,
        y: y - GHOST_PAD,
        frame: false,
        transparent: true,
        hasShadow: false,
        backgroundColor: '#00000000',
        skipTaskbar: true,
        focusable: false,
        resizable: false,
        movable: false,
        alwaysOnTop: true,
        show: false,
        roundedCorners: false,
        thickFrame: false,
        webPreferences: {
            preload: path.join(__dirname, '..', 'preload', 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    ghostWin.setIgnoreMouseEvents(true, { forward: true });
    ghostWin.setAlwaysOnTop(true, 'screen-saver');
    ghostWin.loadFile(path.join(__dirname, '..', 'assets', 'ghost.html'));
    ghostWin.on('closed', () => { ghostWin = null; });
    ghostWin.once('ready-to-show', () => {
        if (!ghostWin || ghostWin.isDestroyed()) return;
        ghostWin.showInactive();
    });

    return ghostWin;
}

function updateGhost(data) {
    if (!ghostWin || ghostWin.isDestroyed()) return;
    if (data.width && data.height) {
        ghostWin.setBounds({
            x: Math.round(data.x - GHOST_PAD),
            y: Math.round(data.y - GHOST_PAD),
            width: Math.round(data.width + GHOST_PAD * 2),
            height: Math.round(data.height + GHOST_PAD * 2)
        });
    }
}

function showGhost() {
    if (!ghostWin || ghostWin.isDestroyed()) return;
    if (!ghostWin.isVisible()) ghostWin.showInactive();
    ghostWin.setAlwaysOnTop(true, 'screen-saver');
}

function hideGhost() {
    if (!ghostWin || ghostWin.isDestroyed()) return;
    ghostWin.hide();
}

function destroyGhost() {
    if (ghostWin && !ghostWin.isDestroyed()) ghostWin.close();
    ghostWin = null;
}

function findWindowByWebContentsId(id) {
    return windows.find(w => !w.isDestroyed() && w.webContents.id === id);
}

function findWindowAtPoint(x, y, excludeWin = null) {
    for (const w of windows) {
        if (w === excludeWin || w.isDestroyed() || !w.isVisible()) continue;
        const b = w.getBounds();
        if (x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height) return w;
    }
    return null;
}

function getKind(win) { return windowKind.get(win) || 'native'; }
function getWin() { return windows[0] || null; }
function getAllWindows() { return windows; }
function sendToWin(ch, ...a) { if (windows[0]) send(windows[0], ch, ...a); }
function sendToWindow(win, ch, ...a) { send(win, ch, ...a); }

function minimize(win) { const w = win || getWin(); if (w) w.minimize(); }
function toggleMax(win) {
    const w = win || getWin();
    if (!w) return;
    if (maximizedMap.get(w)) w.setBounds(prevBoundsMap.get(w));
    else {
        prevBoundsMap.set(w, w.getBounds());
        w.setBounds(screen.getDisplayMatching(w.getBounds()).workArea);
    }
    maximizedMap.set(w, !maximizedMap.get(w));
    send(w, 'win:maxstate', maximizedMap.get(w));
}
function close(win) { const w = win || getWin(); if (w) w.close(); }
function getBounds(win) {
    const w = win || getWin();
    return w ? w.getBounds() : { x: 0, y: 0, width: 0, height: 0 };
}
function setBounds(b, win) {
    const w = win || getWin();
    if (w && !maximizedMap.get(w)) w.setBounds(b);
}
function closeAll() { windows = []; }

module.exports = {
    createWindow, getWin, getAllWindows, sendToWin, sendToWindow,
    minimize, toggleMax, close, getBounds, setBounds, closeAll,
    findWindowByWebContentsId, findWindowAtPoint, getKind,
    createGhostWindow, updateGhost, showGhost, hideGhost, destroyGhost
};