const PINNED_KEY = 'bt_clipboard_pinned';

let pinnedItems = [];
let lastClipText = '';
let pinnedEl = null;
let lastEl = null;
let termRef = null;

function load() {
    try {
        const raw = localStorage.getItem(PINNED_KEY);
        if (raw) pinnedItems = JSON.parse(raw);
        if (!Array.isArray(pinnedItems)) pinnedItems = [];
    } catch { pinnedItems = []; }
}

function save() {
    try { localStorage.setItem(PINNED_KEY, JSON.stringify(pinnedItems)); } catch {}
}

function add(text) {
    if (!text || !text.trim()) return;
    if (pinnedItems.includes(text)) return;
    pinnedItems.unshift(text);
    save();
    renderPinned();
    renderLast();
}

function remove(text) {
    const i = pinnedItems.indexOf(text);
    if (i < 0) return;
    pinnedItems.splice(i, 1);
    save();
    renderPinned();
    renderLast();
}

function insertToTerm(text) {
    if (!text || !termRef) return;
    termRef.focus();
    termRef.paste(text);
}

function makeItem(text, { pinned, onTogglePin }) {
    const el = document.createElement('div');
    el.className = 'clipboard-item' + (pinned ? ' pinned' : '');

    const textEl = document.createElement('span');
    textEl.className = 'clipboard-item-text';
    textEl.textContent = text.length > 100 ? text.slice(0, 100) + '…' : text;
    textEl.title = text;
    textEl.onclick = () => insertToTerm(text);
    el.appendChild(textEl);

    const dot = document.createElement('button');
    dot.className = 'clipboard-dot';
    dot.title = pinned ? 'Unpin' : 'Pin';
    dot.onclick = (e) => { e.stopPropagation(); onTogglePin && onTogglePin(); };
    el.appendChild(dot);

    return el;
}

function renderPinned() {
    if (!pinnedEl) return;
    pinnedEl.innerHTML = '';
    if (pinnedItems.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'clipboard-empty';
        empty.textContent = 'No pinned items';
        pinnedEl.appendChild(empty);
        return;
    }
    pinnedItems.forEach((text) => {
        pinnedEl.appendChild(makeItem(text, {
            pinned: true,
            onTogglePin: () => remove(text)
        }));
    });
}

function renderLast() {
    if (!lastEl) return;
    lastEl.innerHTML = '';
    if (!lastClipText || !lastClipText.trim()) {
        const empty = document.createElement('div');
        empty.className = 'clipboard-empty';
        empty.textContent = 'Empty';
        lastEl.appendChild(empty);
        return;
    }
    const isPinned = pinnedItems.includes(lastClipText);
    lastEl.appendChild(makeItem(lastClipText, {
        pinned: isPinned,
        onTogglePin: () => {
            if (isPinned) remove(lastClipText);
            else add(lastClipText);
        }
    }));
}

async function refreshLast() {
    try {
        const text = await window.api.readClipboard();
        lastClipText = text || '';
    } catch { lastClipText = ''; }
    renderLast();
}

function init(term) {
    termRef = term;
    pinnedEl = document.getElementById('clipboard-pinned');
    lastEl = document.getElementById('clipboard-last');
    load();
    renderPinned();
    renderLast();
}

export { init, refreshLast };