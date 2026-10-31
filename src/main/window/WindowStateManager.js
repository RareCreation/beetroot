const { screen } = require('electron');

class WindowStateManager {
    constructor() {
        this._maximized = new Map();
        this._previousBounds = new Map();
    }

    isMaximized(win) {
        return this._maximized.get(win) === true;
    }

    toggleMaximize(win) {
        if (!win || win.isDestroyed()) return false;

        if (this._maximized.get(win)) {
            const prev = this._previousBounds.get(win);
            if (prev) win.setBounds(prev);
            this._maximized.set(win, false);
        } else {
            this._previousBounds.set(win, win.getBounds());
            const workArea = screen.getDisplayMatching(win.getBounds()).workArea;
            win.setBounds(workArea);
            this._maximized.set(win, true);
        }

        return this._maximized.get(win);
    }

    forget(win) {
        this._maximized.delete(win);
        this._previousBounds.delete(win);
    }

    getBounds(win) {
        if (!win || win.isDestroyed()) return { x: 0, y: 0, width: 0, height: 0 };
        return win.getBounds();
    }

    setBounds(win, bounds) {
        if (!win || win.isDestroyed()) return;
        if (this._maximized.get(win)) return;
        win.setBounds(bounds);
    }
}

module.exports = { WindowStateManager };