class PtyOrchestrator {
    constructor({
                    registry,
                    detachedStore,
                    nativeStrategy,
                    fallbackStrategy,
                    windowRegistry,
                    logger = console
                }) {
        this._registry = registry;
        this._detached = detachedStore;
        this._native = nativeStrategy;
        this._fallback = fallbackStrategy;
        this._windows = windowRegistry;
        this._logger = logger;
    }

    create(id, cols, rows) {
        if (this._registry.has(id) || this._detached.has(id)) return;

        if (process.env.WT_FORCE_FALLBACK) {
            this._startFallback(id, 'forced (WT_FORCE_FALLBACK)');
            return;
        }

        let term;
        try {
            term = this._native.spawn({ cols, rows });
        } catch (error) {
            this._startFallback(id, `native spawn failed: ${error.message}`);
            return;
        }

        const startedAt = Date.now();

        term.onData((data) => {
            if (!this._detached.has(id)) {
                this._sendToTarget(id, 'pty:data', id, data);
            }
        });

        term.onExit(({ exitCode }) => {
            if (Date.now() - startedAt < 3000) {
                this._info(id, `${exitCode}`, '31');
            }
            this._registry.delete(id);
            this._detached.delete(id);
        });

        this._registry.set(id, {
            type: 'native',
            term,
            targetWindow: this._windows.getPrimary()
        });
        this._registry.setActive(id);
    }

    _startFallback(id, reason) {
        this._info(id, `${reason}. Fallback mode.`);

        const handle = this._fallback.spawn({
            onData: (data) => {
                if (!this._detached.has(id)) {
                    this._sendToTarget(id, 'pty:data', id, data);
                }
            },
            onExit: () => {
                this._registry.delete(id);
                this._detached.delete(id);
            }
        });

        if (!handle) return;

        this._sendToTarget(id, 'pty:mode', id, 'line');
        this._registry.set(id, {
            type: 'fallback',
            handle,
            targetWindow: this._windows.getPrimary()
        });
        this._registry.setActive(id);
    }

    _info(id, message, color = '33') {
        this._logger.log('[beetroot]', message);
        this._sendToTarget(id, 'pty:data', id, `\r\n\x1b[${color}m[bt] ${message}\x1b[0m\r\n`);
    }

    _sendToTarget(id, channel, ...args) {
        const instance = this._registry.get(id);
        const target = instance && instance.targetWindow;

        if (target && !target.isDestroyed()) {
            target.webContents.send(channel, ...args);
            return;
        }

        const primary = this._windows.getPrimary();
        if (primary) primary.webContents.send(channel, ...args);
    }

    setTargetWindow(id, win) {
        const instance = this._registry.get(id);
        if (instance) instance.targetWindow = win;
    }

    input(id, data) {
        const instance = this._registry.get(id) || this._detached.get(id);
        if (!instance) return;

        const target = instance.term || instance.handle || (instance.inst && instance.inst.term) || (instance.inst && instance.inst.handle);
        if (!target) return;

        try {
            if (typeof target.write === 'function') target.write(data);
            else if (target.term && typeof target.term.write === 'function') target.term.write(data);
        } catch (_) {}
    }

    resizeActive(cols, rows) {
        const instance = this._registry.getActive();
        if (!instance) return;
        const term = instance.term;
        if (term && typeof term.resize === 'function') {
            try { term.resize(cols, rows); } catch (_) {}
        }
    }

    reattach(id) {
        const instance = this._registry.get(id);
        if (!instance) return;
        if (instance.type === 'native' && instance.term) {
            try { instance.term.resize(80, 24); } catch (_) {}
        }
    }

    exists(id) {
        return this._registry.has(id) || this._detached.has(id);
    }

    detach(id, title) {
        const instance = this._registry.get(id);
        if (!instance) return false;

        this._detached.set(id, {
            inst: instance,
            title: title || 'Restored Session'
        });
        instance.targetWindow = null;
        this._registry.delete(id);
        return true;
    }

    attach(id, targetWindow) {
        const record = this._detached.get(id);
        if (!record) return false;

        const instance = record.inst;
        instance.targetWindow = targetWindow;

        this._detached.delete(id);
        this._registry.set(id, instance);

        targetWindow.webContents.send('pty:adopt', {
            ptyId: id,
            title: record.title || 'Restored Session'
        });
        return true;
    }

    listDetachedSessions() {
        return this._detached.list();
    }

    kill(id) {
        const instance = this._registry.get(id) || (this._detached.get(id) || {}).inst;
        if (!instance) return;

        const target = instance.term || instance.handle;
        if (target && typeof target.kill === 'function') {
            try { target.kill(); } catch (_) {}
        }

        this._registry.delete(id);
        this._detached.delete(id);
    }

    killAll() {
        for (const [id] of this._registry.entries()) this.kill(id);
        for (const [id] of this._detached.entries()) this.kill(id);
    }
}

module.exports = { PtyOrchestrator };