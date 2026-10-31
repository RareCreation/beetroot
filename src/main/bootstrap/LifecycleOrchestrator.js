const { app } = require('electron');

class LifecycleOrchestrator {
    constructor({ onReady, onWindowAllClosed, onBeforeQuit, onWillQuit } = {}) {
        this._onReady = onReady;
        this._onWindowAllClosed = onWindowAllClosed;
        this._onBeforeQuit = onBeforeQuit;
        this._onWillQuit = onWillQuit;
        this._bound = false;
    }

    bind() {
        if (this._bound) return;
        this._bound = true;

        app.whenReady().then(() => {
            if (typeof this._onReady === 'function') this._onReady();
        });

        app.on('window-all-closed', () => {
            if (typeof this._onWindowAllClosed === 'function') this._onWindowAllClosed();
        });

        app.on('before-quit', () => {
            if (typeof this._onBeforeQuit === 'function') this._onBeforeQuit();
        });

        app.on('will-quit', () => {
            if (typeof this._onWillQuit === 'function') this._onWillQuit();
        });
    }
}

module.exports = { LifecycleOrchestrator };