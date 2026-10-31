const PINNED_KEY = 'bt_clipboard_pinned';

class ClipboardStore {
    constructor() {
        this._pinnedItems = [];
        this._lastText = '';
        this._load();
    }

    _load() {
        try {
            const raw = localStorage.getItem(PINNED_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            this._pinnedItems = Array.isArray(parsed) ? parsed : [];
        } catch (_) {
            this._pinnedItems = [];
        }
    }

    _persist() {
        try {
            localStorage.setItem(PINNED_KEY, JSON.stringify(this._pinnedItems));
        } catch (_) {}
    }

    getPinned() {
        return this._pinnedItems.slice();
    }

    getLast() {
        return this._lastText;
    }

    setLast(text) {
        this._lastText = text || '';
    }

    isPinned(text) {
        return this._pinnedItems.includes(text);
    }

    addPinned(text) {
        if (!text || !text.trim()) return false;
        if (this._pinnedItems.includes(text)) return false;
        this._pinnedItems.unshift(text);
        this._persist();
        return true;
    }

    removePinned(text) {
        const index = this._pinnedItems.indexOf(text);
        if (index < 0) return false;
        this._pinnedItems.splice(index, 1);
        this._persist();
        return true;
    }
}

export { ClipboardStore };