class ClipboardItemFactory {
    constructor({ onInsert, onTogglePin }) {
        this._onInsert = onInsert;
        this._onTogglePin = onTogglePin;
    }

    create(text, { pinned }) {
        const el = document.createElement('div');
        el.className = 'clipboard-item' + (pinned ? ' pinned' : '');

        const textEl = document.createElement('span');
        textEl.className = 'clipboard-item-text';
        textEl.textContent = text.length > 100 ? text.slice(0, 100) + '…' : text;
        textEl.title = text;
        textEl.onclick = () => this._onInsert(text);
        el.appendChild(textEl);

        const dot = document.createElement('button');
        dot.className = 'clipboard-dot';
        dot.title = pinned ? 'Unpin' : 'Pin';
        dot.onclick = (event) => {
            event.stopPropagation();
            if (this._onTogglePin) this._onTogglePin(text, pinned);
        };
        el.appendChild(dot);

        return el;
    }

    createEmpty(message) {
        const el = document.createElement('div');
        el.className = 'clipboard-empty';
        el.textContent = message;
        return el;
    }
}

export { ClipboardItemFactory };