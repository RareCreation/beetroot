class DependencyContainer {
    constructor() {
        this._factories = new Map();
        this._instances = new Map();
    }

    register(name, factory, { singleton = true } = {}) {
        if (typeof factory !== 'function') {
            throw new TypeError(`Factory for "${name}" must be a function`);
        }
        this._factories.set(name, { factory, singleton });
        this._instances.delete(name);
    }

    registerValue(name, value) {
        this._factories.set(name, { factory: () => value, singleton: true });
        this._instances.set(name, value);
    }

    resolve(name) {
        if (this._instances.has(name)) return this._instances.get(name);
        const entry = this._factories.get(name);
        if (!entry) throw new Error(`Dependency "${name}" is not registered`);
        const instance = entry.factory(this);
        if (entry.singleton) this._instances.set(name, instance);
        return instance;
    }

    has(name) {
        return this._instances.has(name) || this._factories.has(name);
    }

    dispose() {
        for (const instance of this._instances.values()) {
            if (instance && typeof instance.dispose === 'function') {
                try { instance.dispose(); } catch (_) {}
            }
        }
        this._instances.clear();
        this._factories.clear();
    }
}

module.exports = { DependencyContainer };