const { ipcMain } = require('electron');

class PtyIpcHandler {
    constructor({ ptyOrchestrator, windowRegistry, browserWindowFactory }) {
        this._pty = ptyOrchestrator;
        this._windows = windowRegistry;
        this._factory = browserWindowFactory;
    }

    register() {
        ipcMain.on('pty:create', (_, { id, cols, rows }) => {
            this._pty.create(id, cols, rows);
        });

        ipcMain.on('pty:kill', (_, id) => {
            this._pty.kill(id);
        });

        ipcMain.on('pty:input', (_, { id, data }) => {
            this._pty.input(id, data);
        });

        ipcMain.on('pty:resize-active', (_, { cols, rows }) => {
            this._pty.resizeActive(cols, rows);
        });

        ipcMain.handle('pty:exists', (_, id) => {
            return this._pty.exists(id);
        });

        ipcMain.on('pty:reattach', (event, { id }) => {
            const win = this._windows.findByWebContentsId(event.sender.id);
            if (win) {
                this._pty.setTargetWindow(id, win);
                this._pty.reattach(id);
            }
        });

        ipcMain.handle('pty:detach', (_, id, title) => {
            return this._pty.detach(id, title);
        });

        ipcMain.handle('pty:get-detached', () => {
            return this._pty.listDetachedSessions();
        });

        ipcMain.handle('pty:attach', (event, id) => {
            const win = this._windows.findByWebContentsId(event.sender.id);
            if (!win) return false;
            return this._pty.attach(id, win);
        });

        ipcMain.on('pty:transfer', (_, { ptyId, title, targetWebContentsId }) => {
            const target = this._windows.findByWebContentsId(targetWebContentsId);
            if (!target) return;
            this._pty.setTargetWindow(ptyId, target);
            target.webContents.send('pty:adopt', { ptyId, title });
        });

        ipcMain.on('window:new-artificial-with-pty', (event, { ptyId, title, bounds }) => {
            const source = this._windows.findByWebContentsId(event.sender.id);
            if (!source) return;

            const win = this._factory.create({
                kind: 'artificial',
                width: bounds && bounds.width,
                height: bounds && bounds.height,
                x: bounds && bounds.x,
                y: bounds && bounds.y
            });

            this._pty.setTargetWindow(ptyId, win);

            win.webContents.once('did-finish-load', () => {
                win.webContents.send('pty:adopt', { ptyId, title: title || null });
            });
        });
    }
}

module.exports = { PtyIpcHandler };