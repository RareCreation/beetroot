class PtyRegistry {
    constructor() {
        this._instances = new Map();
        this._activeId = null;
    }

    set(id, instance) {
        this._instances.set(id, instance);
    }

    get(id) {
        return this._instances.get(id) || null;
    }

    has(id) {
        return this._instances.has(id);
    }

    delete(id) {
        this._instances.delete(id);
    }

    entries() {
        return Array.from(this._instances.entries());
    }

    ids() {
        return Array.from(this._instances.keys());
    }

    setActive(id) {
        this._activeId = id;
    }

    getActive() {
        if (!this._activeId) return null;
        return this._instances.get(this._activeId) || null;
    }

    getActiveId() {
        return this._activeId;
    }

    clear() {
        this._instances.clear();
        this._activeId = null;
    }
}

module.exports = { PtyRegistry };