class RendererErrorBoundary {
    constructor({ getActiveTerminal, logger = console } = {}) {
        this._getActiveTerminal = getActiveTerminal;
        this._logger = logger;
        this._installed = false;
    }

    install() {
        if (this._installed) return;
        this._installed = true;

        window.addEventListener('error', (event) => {
            this._logger.error('[renderer] error', event.error || event.message);
            this._writeToTerminal(event.message);
        });

        window.addEventListener('unhandledrejection', (event) => {
            this._logger.error('[renderer] unhandled rejection', event.reason);
            this._writeToTerminal(String(event.reason));
        });
    }

    _writeToTerminal(message) {
        const term = this._getActiveTerminal ? this._getActiveTerminal() : null;
        if (!term) return;
        try {
            term.write('\r\n\x1b[31m[bt] ' + message + '\x1b[0m\r\n');
        } catch (_) {}
    }
}

export { RendererErrorBoundary };