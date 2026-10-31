const { app } = require('electron');

class SingleInstanceGuard {
    constructor({ onSecondInstance } = {}) {
        this._onSecondInstance = onSecondInstance;
        this._acquired = false;
    }

    acquire() {
        this._acquired = app.requestSingleInstanceLock();
        if (!this._acquired) {
            app.quit();
            return false;
        }
        app.on('second-instance', () => {
            if (typeof this._onSecondInstance === 'function') {
                try { this._onSecondInstance(); } catch (_) {}
            }
        });
        return true;
    }

    isAcquired() {
        return this._acquired;
    }
}

module.exports = { SingleInstanceGuard };