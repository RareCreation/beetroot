class ToastNotifier {
    constructor({ containerId, durationMs = 4000 } = {}) {
        this._containerId = containerId;
        this._durationMs = durationMs;
    }

    _getContainer() {
        return document.getElementById(this._containerId);
    }

    show(message, onAction) {
        const container = this._getContainer();
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast';

        const text = document.createElement('span');
        text.textContent = message;
        toast.appendChild(text);

        if (onAction) {
            const btn = document.createElement('button');
            btn.className = 'toast-btn';
            btn.textContent = 'View';
            btn.onclick = () => {
                onAction();
                this._dismiss(toast);
            };
            toast.appendChild(btn);
        }

        container.appendChild(toast);
        setTimeout(() => this._dismiss(toast), this._durationMs);
    }

    _dismiss(toast) {
        if (!toast.parentNode) return;
        toast.classList.add('hiding');
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 300);
    }
}

export { ToastNotifier };