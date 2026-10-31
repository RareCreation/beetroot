class WindowHitTestResolver {
    constructor({ registry }) {
        this._registry = registry;
    }

    resolveScreenPoint(x, y, exclude = null) {
        return this._registry.findAtPoint(x, y, exclude);
    }

    resolveWebContentsId(id) {
        return this._registry.findByWebContentsId(id);
    }
}

module.exports = { WindowHitTestResolver };