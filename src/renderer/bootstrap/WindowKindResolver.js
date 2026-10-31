class WindowKindResolver {
    constructor() {
        this._kind = null;
        this._listeners = new Set();
        this._bound = false;
    }

    bind() {
        if (this._bound) return;
        this._bound = true;

        window.api.onWindowKind((data) => {
            this._kind = data.kind;
            for (const listener of Array.from(this._listeners)) {
                try { listener(this._kind); } catch (_) {}
            }
        });
    }

    getKind() {
        return this._kind;
    }

    isResolved() {
        return this._kind !== null;
    }

    onResolved(callback) {
        if (typeof callback !== 'function') return () => {};
        if (this._kind !== null) {
            callback(this._kind);
            return () => {};
        }
        this._listeners.add(callback);
        return () => this._listeners.delete(callback);
    }
}

export { WindowKindResolver };