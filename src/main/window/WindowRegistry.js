class WindowRegistry {
    constructor() {
        this._windows = [];
        this._kindMap = new Map();
    }

    add(win, kind = 'native') {
        if (!win || this._windows.includes(win)) return;
        this._windows.push(win);
        this._kindMap.set(win, kind);
        win.on('closed', () => this.remove(win));
    }

    remove(win) {
        const index = this._windows.indexOf(win);
        if (index !== -1) this._windows.splice(index, 1);
        this._kindMap.delete(win);
    }

    getAll() {
        return this._windows.filter((w) => !w.isDestroyed());
    }

    getPrimary() {
        return this.getAll()[0] || null;
    }

    getKind(win) {
        return this._kindMap.get(win) || 'native';
    }

    findByWebContentsId(id) {
        return this.getAll().find((w) => w.webContents.id === id) || null;
    }

    findAtPoint(x, y, exclude = null) {
        for (const w of this.getAll()) {
            if (w === exclude) continue;
            if (!w.isVisible()) continue;
            const b = w.getBounds();
            if (x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height) {
                return w;
            }
        }
        return null;
    }

    destroyAll() {
        this._windows = [];
        this._kindMap.clear();
    }
}

module.exports = { WindowRegistry };