import { ClipboardStore } from './ClipboardStore.js';
import { ClipboardItemFactory } from './ClipboardItemFactory.js';

const store = new ClipboardStore();

let pinnedContainer = null;
let lastContainer = null;
let getTerminalRef = null;

function insertToTerminal(text) {
    if (!text || !getTerminalRef) return;
    const term = getTerminalRef();
    if (!term) return;
    term.focus();
    term.paste(text);
}

const itemFactory = new ClipboardItemFactory({
    onInsert: (text) => insertToTerminal(text),
    onTogglePin: (text, isPinned) => {
        if (isPinned) store.removePinned(text);
        else store.addPinned(text);
        renderPinned();
        renderLast();
    }
});

function renderPinned() {
    if (!pinnedContainer) return;
    pinnedContainer.innerHTML = '';
    const items = store.getPinned();
    if (items.length === 0) {
        pinnedContainer.appendChild(itemFactory.createEmpty('No pinned items'));
        return;
    }
    for (const text of items) {
        pinnedContainer.appendChild(itemFactory.create(text, { pinned: true }));
    }
}

function renderLast() {
    if (!lastContainer) return;
    lastContainer.innerHTML = '';
    const text = store.getLast();
    if (!text || !text.trim()) {
        lastContainer.appendChild(itemFactory.createEmpty('Empty'));
        return;
    }
    lastContainer.appendChild(itemFactory.create(text, { pinned: store.isPinned(text) }));
}

async function refreshLast() {
    try {
        const text = await window.api.readClipboard();
        store.setLast(text || '');
    } catch (_) {
        store.setLast('');
    }
    renderLast();
}

function init(getTerminal) {
    getTerminalRef = getTerminal;
    pinnedContainer = document.getElementById('clipboard-pinned');
    lastContainer = document.getElementById('clipboard-last');
    renderPinned();
    renderLast();
}

window.__clipboardRefresh = refreshLast;

export { init, refreshLast };