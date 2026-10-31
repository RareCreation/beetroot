const { BrowserWindow } = require('electron');
const path = require('path');

const GHOST_PADDING = 24;

class GhostWindowController {
    constructor({ logger = console } = {}) {
        this._logger = logger;
        this._ghost = null;
    }

    ensure(options = {}) {
        const contentWidth = options.width || 160;
        const contentHeight = options.height || 26;
        const x = options.x || 0;
        const y = options.y || 0;

        const width = contentWidth + GHOST_PADDING * 2;
        const height = contentHeight + GHOST_PADDING * 2;

        if (this._ghost && !this._ghost.isDestroyed()) {
            this._ghost.setBounds({
                x: Math.round(x - GHOST_PADDING),
                y: Math.round(y - GHOST_PADDING),
                width,
                height
            });
            return this._ghost;
        }

        this._ghost = new BrowserWindow({
            width,
            height,
            x: Math.round(x - GHOST_PADDING),
            y: Math.round(y - GHOST_PADDING),
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
                preload: path.join(__dirname, '..', '..', 'preload', 'PreloadEntryPoint.js'),
                contextIsolation: true,
                nodeIntegration: false
            }
        });

        this._ghost.setIgnoreMouseEvents(true, { forward: true });
        this._ghost.setAlwaysOnTop(true, 'screen-saver');
        this._ghost.loadFile(path.join(__dirname, '..', '..', 'assets', 'ghost.html'));
        this._ghost.on('closed', () => { this._ghost = null; });
        this._ghost.once('ready-to-show', () => {
            if (!this._ghost || this._ghost.isDestroyed()) return;
            this._ghost.showInactive();
        });

        return this._ghost;
    }

    updatePosition(position) {
        if (!this._ghost || this._ghost.isDestroyed()) return;
        this._ghost.setBounds({
            x: Math.round(position.x - GHOST_PADDING),
            y: Math.round(position.y - GHOST_PADDING),
            width: Math.round(position.width + GHOST_PADDING * 2),
            height: Math.round(position.height + GHOST_PADDING * 2)
        });
    }

    show() {
        if (!this._ghost || this._ghost.isDestroyed()) return;
        if (!this._ghost.isVisible()) this._ghost.showInactive();
        this._ghost.setAlwaysOnTop(true, 'screen-saver');
    }

    hide() {
        if (!this._ghost || this._ghost.isDestroyed()) return;
        this._ghost.hide();
    }

    send(channel, payload) {
        if (!this._ghost || this._ghost.isDestroyed()) return;
        this._ghost.webContents.send(channel, payload);
    }

    destroy() {
        if (this._ghost && !this._ghost.isDestroyed()) this._ghost.close();
        this._ghost = null;
    }
}

module.exports = { GhostWindowController };