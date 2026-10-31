const { ipcMain } = require('electron');

class WindowIpcHandler {
    constructor({ windowRegistry, windowStateManager, browserWindowFactory }) {
        this._windows = windowRegistry;
        this._state = windowStateManager;
        this._factory = browserWindowFactory;
    }

    register() {
        ipcMain.on('win:min', (event) => {
            const win = this._windows.findByWebContentsId(event.sender.id);
            if (win) win.minimize();
        });

        ipcMain.on('win:max', (event) => {
            const win = this._windows.findByWebContentsId(event.sender.id);
            if (!win) return;
            const maximized = this._state.toggleMaximize(win);
            win.webContents.send('win:maxstate', maximized);
        });

        ipcMain.on('win:close', (event) => {
            const win = this._windows.findByWebContentsId(event.sender.id);
            if (win) win.close();
        });

        ipcMain.handle('win:getBounds', (event) => {
            const win = this._windows.findByWebContentsId(event.sender.id);
            return this._state.getBounds(win);
        });

        ipcMain.on('win:setBounds', (event, bounds) => {
            const win = this._windows.findByWebContentsId(event.sender.id);
            if (win) this._state.setBounds(win, bounds);
        });

        ipcMain.handle('win:pin', (event) => {
            const win = this._windows.findByWebContentsId(event.sender.id);
            if (!win) return false;
            win.setAlwaysOnTop(!win.isAlwaysOnTop());
            return win.isAlwaysOnTop();
        });

        ipcMain.on('window:create-artificial', (event, payload) => {
            this._spawnArtificialWindow(event, payload);
        });

        ipcMain.on('window:spawn-artificial', (event, payload) => {
            this._spawnArtificialWindow(event, payload);
        });
    }

    _spawnArtificialWindow(event, payload) {
        const source = this._windows.findByWebContentsId(event.sender.id);
        if (!source) return;

        const win = this._factory.create({
            kind: 'artificial',
            width: payload && payload.width,
            height: payload && payload.height,
            x: payload && payload.x,
            y: payload && payload.y,
            init: payload && payload.init
        });

        if (payload && payload.ptyId) {
            win.webContents.once('did-finish-load', () => {
                win.webContents.send('pty:adopt', {
                    ptyId: payload.ptyId,
                    title: payload.title || null
                });
            });
        }
    }
}

module.exports = { WindowIpcHandler };