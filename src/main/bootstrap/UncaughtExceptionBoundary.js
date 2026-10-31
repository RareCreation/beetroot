class UncaughtExceptionBoundary {
    constructor({ logger = console } = {}) {
        this._logger = logger;
        this._installed = false;
        this._handlers = [];
    }

    install() {
        if (this._installed) return;
        this._installed = true;

        const exceptionHandler = (error) => {
            this._logger.error('[beetroot] uncaught exception', error);
            this._notifyHandlers(error);
        };

        const rejectionHandler = (reason) => {
            this._logger.error('[beetroot] unhandled rejection', reason);
            this._notifyHandlers(reason);
        };

        process.on('uncaughtException', exceptionHandler);
        process.on('unhandledRejection', rejectionHandler);
        this._handlers.push(
            () => process.off('uncaughtException', exceptionHandler),
            () => process.off('unhandledRejection', rejectionHandler)
        );
    }

    onError(callback) {
        if (typeof callback === 'function') this._handlers.push(callback);
    }

    _notifyHandlers(error) {
        for (const handler of this._handlers.slice()) {
            if (handler.length === 0) continue;
            try { handler(error); } catch (_) {}
        }
    }

    dispose() {
        while (this._handlers.length) {
            const fn = this._handlers.pop();
            try { fn(); } catch (_) {}
        }
        this._installed = false;
    }
}

module.exports = { UncaughtExceptionBoundary };