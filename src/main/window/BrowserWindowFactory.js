const { BrowserWindow } = require('electron');
const path = require('path');

class BrowserWindowFactory {
    constructor({ registry, stateManager }) {
        this._registry = registry;
        this._stateManager = stateManager;
    }

    create(options = {}) {
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
            icon: path.join(__dirname, '..', '..', 'assets', 'icon.ico'),
            show: false,
            webPreferences: {
                preload: path.join(__dirname, '..', '..', 'preload', 'PreloadEntryPoint.js'),
                contextIsolation: true,
                nodeIntegration: false
            }
        });

        win.setMenu(null);
        win.loadFile(path.join(__dirname, '..', '..', 'assets', 'index.html'));

        this._registry.add(win, kind);

        win.once('ready-to-show', () => win.show());

        win.webContents.once('did-finish-load', () => {
            win.webContents.focus();
            win.webContents.send('window:kind', { kind });
            if (options.init) win.webContents.send('window:init', options.init);
        });

        win.webContents.on('before-input-event', (event, input) => {
            const isDevTools =
                input.key === 'F12' ||
                (input.control && input.shift && input.key.toLowerCase() === 'i');
            if (input.type === 'keyDown' && isDevTools) {
                if (win.webContents.isDevToolsOpened()) win.webContents.closeDevTools();
                else win.webContents.openDevTools({ mode: 'detach' });
            }
        });

        win.on('closed', () => {
            this._stateManager.forget(win);
        });

        return win;
    }
}

module.exports = { BrowserWindowFactory };