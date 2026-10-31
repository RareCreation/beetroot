class KeyboardShortcutRegistry {
    constructor({ logger = console } = {}) {
        this._bindings = [];
        this._logger = logger;
        this._installed = false;
        this._handler = null;
    }

    register(binding) {
        if (!binding || typeof binding.handler !== 'function') return () => {};
        const entry = {
            key: (binding.key || '').toLowerCase(),
            ctrl: !!binding.ctrl,
            shift: !!binding.shift,
            alt: !!binding.alt,
            meta: !!binding.meta,
            preventDefault: binding.preventDefault !== false,
            stopPropagation: binding.stopPropagation !== false,
            handler: binding.handler
        };
        this._bindings.push(entry);
        return () => {
            const index = this._bindings.indexOf(entry);
            if (index !== -1) this._bindings.splice(index, 1);
        };
    }

    install() {
        if (this._installed) return;
        this._installed = true;

        this._handler = (event) => {
            if (event.isComposing) return;
            if (event.repeat) return;

            const key = (event.key || '').toLowerCase();

            for (const binding of this._bindings) {
                if (binding.key !== key) continue;
                if (binding.ctrl !== event.ctrlKey) continue;
                if (binding.shift !== event.shiftKey) continue;
                if (binding.alt !== event.altKey) continue;
                if (binding.meta !== event.metaKey) continue;

                if (binding.preventDefault) event.preventDefault();
                if (binding.stopPropagation) event.stopPropagation();

                try {
                    binding.handler(event);
                } catch (error) {
                    this._logger.error('[shortcuts] handler failed', error);
                }
                return;
            }
        };

        window.addEventListener('keydown', this._handler, true);
    }

    dispose() {
        if (!this._installed) return;
        window.removeEventListener('keydown', this._handler, true);
        this._handler = null;
        this._installed = false;
        this._bindings = [];
    }
}

export { KeyboardShortcutRegistry };