const { ipcMain } = require('electron');

class ClipboardIpcHandler {
    constructor({ clipboardGateway }) {
        this._clipboard = clipboardGateway;
    }

    register() {
        ipcMain.handle('clip:read', () => {
            return this._clipboard.read();
        });

        ipcMain.on('clip:write', (_, text) => {
            this._clipboard.write(text);
        });
    }
}

module.exports = { ClipboardIpcHandler };