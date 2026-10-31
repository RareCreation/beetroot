class SessionsPanel {
    constructor({ element }) {
        this._element = element;
    }

    open() {
        this._element.classList.remove('hidden');
    }

    close() {
        this._element.classList.add('hidden');
    }

    isOpen() {
        return !this._element.classList.contains('hidden');
    }

    contains(target) {
        return this._element.contains(target);
    }
}

export { SessionsPanel };