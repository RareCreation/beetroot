const { BrowserWindow, screen } = require('electron');
const path = require('path');

let win = null;
let maximized = false;
let prevBounds = null;

const send = (ch, ...a) => {
    if (win && !win.isDestroyed()) win.webContents.send(ch, ...a);
};

function createWindow() {
    win = new BrowserWindow({
        width: 1000,
        height: 640,
        minWidth: 480,
        minHeight: 300,
        frame: false,
        transparent: true,
        hasShadow: false,
        backgroundColor: '#00000000',
        icon: path.join(__dirname, '..', 'assets', 'icon.ico'),
        webPreferences: {
            preload: path.join(__dirname, '..', 'preload', 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.setMenu(null);
    win.loadFile(path.join(__dirname, '..', 'assets', 'index.html'));
    win.webContents.once('did-finish-load', () => win.webContents.focus());

    win.webContents.on('before-input-event', (e, input) => {
        const isDev = input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i');
        if (input.type === 'keyDown' && isDev) {
            if (win.webContents.isDevToolsOpened()) win.webContents.closeDevTools();
            else win.webContents.openDevTools({ mode: 'detach' });
        }
    });

    return win;
}

function getWin() { return win; }
function sendToWin(ch, ...a) { send(ch, ...a); }
function minimize() { if (win) win.minimize(); }
function toggleMax() {
    if (!win) return;
    if (maximized) win.setBounds(prevBounds);
    else {
        prevBounds = win.getBounds();
        win.setBounds(screen.getDisplayMatching(prevBounds).workArea);
    }
    maximized = !maximized;
    send('win:maxstate', maximized);
}
function close() { if (win) win.close(); }
function getBounds() { return win ? win.getBounds() : { x: 0, y: 0, width: 0, height: 0 }; }
function setBounds(b) { if (win && !maximized) win.setBounds(b); }
function closeAll() { win = null; }

module.exports = {
    createWindow, getWin, sendToWin, minimize, toggleMax, close,
    getBounds, setBounds, closeAll
};