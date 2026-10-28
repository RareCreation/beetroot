const { ipcMain } = require('electron');
const win = require('./window');
const pty = require('./pty');
const clip = require('./clipboard');

let ptyStarted = false;

function registerIpc() {
    ipcMain.on('pty:ready', (_, { cols, rows }) => {
        if (ptyStarted) return;
        ptyStarted = true;
        pty.start(cols, rows);
    });

    ipcMain.on('pty:input', (_, d) => pty.input(d));
    ipcMain.on('pty:resize', (_, { cols, rows }) => pty.resize(cols, rows));

    ipcMain.handle('clip:read', () => clip.read());
    ipcMain.on('clip:write', (_, t) => clip.write(t));

    ipcMain.on('win:min', () => win.minimize());
    ipcMain.on('win:max', () => win.toggleMax());
    ipcMain.on('win:close', () => win.close());
    ipcMain.handle('win:getBounds', () => win.getBounds());
    ipcMain.on('win:setBounds', (_, b) => win.setBounds(b));
    ipcMain.handle('win:pin', () => {
        const w = win.getWin();
        if (!w) return false;
        w.setAlwaysOnTop(!w.isAlwaysOnTop());
        return w.isAlwaysOnTop();
    });
}

module.exports = { registerIpc };