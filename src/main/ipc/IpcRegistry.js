class IpcRegistry {
    constructor({ handlers = [] } = {}) {
        this._handlers = handlers;
        this._registered = false;
    }

    registerAll() {
        if (this._registered) return;
        this._registered = true;
        for (const handler of this._handlers) {
            if (handler && typeof handler.register === 'function') {
                handler.register();
            }
        }
    }
}

module.exports = { IpcRegistry };