import { createTerminalInstance, bindInput } from './terminal.js';
import { getActiveTermTheme } from './theme-manager.js';

const MAX_TABS = 10;
const DRAG_THRESHOLD = 5;
const DETACH_Y_THRESHOLD = 60;

export function createTabsManager(initialPtyId, initialTitle, skipAutoCreate) {
    const tabsList = document.getElementById('tabs-list');
    const btnNewTab = document.getElementById('btn-new-tab');
    const emptyState = document.getElementById('empty-state');

    let tabs = [];
    let activeTabId = null;
    const manager = {};
    let drag = null;

    function generatePtyId() { return 'pty-' + Math.random().toString(36).substr(2, 9); }

    function getNextAvailableNumber() {
        const used = new Set();
        tabs.forEach(function(tab) {
            const m = tab.title.match(/^Terminal (\d+)$/);
            if (m) used.add(Number(m[1]));
        });
        let n = 1;
        while (used.has(n)) n++;
        return n;
    }

    function updateEmptyState() { if (emptyState) emptyState.classList.toggle('hidden', tabs.length > 0); }
    function updateNewTabButton() {
        if (!btnNewTab) return;
        const full = tabs.length >= MAX_TABS;
        btnNewTab.disabled = full;
        btnNewTab.classList.toggle('disabled', full);
    }

    function removeTabFromUI(id) {
        const index = tabs.findIndex(function(t) { return t.id === id; });
        if (index === -1) return;
        const tab = tabs[index];
        tab.observer.disconnect();
        tab.term.dispose();
        tab.container.remove();
        tabs.splice(index, 1);
        if (activeTabId === id) {
            if (tabs.length > 0) switchTab(tabs[Math.min(index, tabs.length - 1)].id);
            else { activeTabId = null; updateTabsUI(); }
        } else {
            updateTabsUI();
        }
    }

    function updateTabsUI() {
        tabsList.innerHTML = '';
        tabs.forEach(function(tab) {
            const el = document.createElement('div');
            el.className = 'tab' + (tab.id === activeTabId ? ' active' : '');
            el.dataset.id = tab.id;
            const titleEl = document.createElement('span');
            titleEl.className = 'tab-title';
            titleEl.textContent = tab.title;
            el.appendChild(titleEl);

            const detachBtn = document.createElement('button');
            detachBtn.className = 'tab-detach';
            detachBtn.title = 'Move to Background';
            detachBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`;
            detachBtn.onclick = async function(e) {
                e.stopPropagation();
                try {
                    const ok = await window.api.detachPty(tab.id, tab.title);
                    if (!ok) return;
                    removeTabFromUI(tab.id);
                    if (manager.onSessionChange) manager.onSessionChange();
                } catch (err) {
                    console.error('[TAB DETACH] error:', err);
                }
            };
            el.appendChild(detachBtn);

            const closeBtn = document.createElement('button');
            closeBtn.className = 'tab-close';
            closeBtn.innerHTML = '×';
            closeBtn.onclick = function(e) { e.stopPropagation(); closeTab(tab.id); };
            el.appendChild(closeBtn);

            el.addEventListener('pointerdown', function(e) { onPointerDown(e, tab.id, el); });
            el.addEventListener('contextmenu', function(e) { onContextMenu(e, tab.id); });
            tabsList.appendChild(el);
        });
        updateEmptyState();
        updateNewTabButton();
    }

    function onContextMenu(e, id) {
        e.preventDefault();
        e.stopPropagation();
        const tab = tabs.find(function(t) { return t.id === id; });
        if (!tab) return;
        startRename(tab);
    }

    function startRename(tab) {
        const el = tabsList.querySelector('.tab[data-id="' + tab.id + '"]');
        if (!el || el.classList.contains('renaming')) return;
        el.classList.add('renaming');

        const titleEl = el.querySelector('.tab-title');
        if (!titleEl) return;
        const oldTitle = tab.title;

        const input = document.createElement('input');
        input.className = 'tab-rename-input';
        input.type = 'text';
        input.value = oldTitle;
        input.maxLength = 60;
        input.setAttribute('spellcheck', 'false');
        input.setAttribute('autocomplete', 'off');

        titleEl.style.display = 'none';
        el.insertBefore(input, titleEl.nextSibling);

        requestAnimationFrame(function() {
            input.focus();
            input.select();
        });

        let finished = false;

        function commit(save) {
            if (finished) return;
            finished = true;
            const value = input.value.trim();
            if (save && value && value !== oldTitle) {
                tab.title = value;
            }
            el.classList.remove('renaming');
            titleEl.style.display = '';
            titleEl.textContent = tab.title;
            if (input.parentNode) input.remove();
            if (save) updateTabsUI();
        }

        input.addEventListener('keydown', function(ev) {
            ev.stopPropagation();
            if (ev.key === 'Enter') { ev.preventDefault(); commit(true); }
            else if (ev.key === 'Escape') { ev.preventDefault(); commit(false); }
        });
        input.addEventListener('blur', function() { commit(true); });
        input.addEventListener('pointerdown', function(ev) { ev.stopPropagation(); });
        input.addEventListener('mousedown', function(ev) { ev.stopPropagation(); });
        input.addEventListener('click', function(ev) { ev.stopPropagation(); });
    }

    function onPointerDown(e, id, el) {
        if (e.button !== 0) return;
        if (e.target.closest('.tab-close') || e.target.closest('.tab-detach')) return;
        if (e.target.classList && e.target.classList.contains('tab-rename-input')) return;
        if (drag) return;

        const titleEl = el.querySelector('.tab-title');
        const tabTitle = titleEl ? titleEl.textContent : 'Terminal';

        drag = {
            id: id,
            el: el,
            startX: e.clientX,
            startY: e.clientY,
            currentX: e.clientX,
            currentY: e.clientY,
            moved: false,
            detached: false,
            placeholder: null,
            targetWindowId: null,
            tabTitle: tabTitle
        };

        const moveHandler = function(ev) { onPointerMove(ev); };
        const upHandler = function() { onPointerUp(); };
        drag.__moveHandler = moveHandler;
        drag.__upHandler = upHandler;
        document.addEventListener('pointermove', moveHandler);
        document.addEventListener('pointerup', upHandler);
        document.addEventListener('pointercancel', upHandler);
    }

    function beginVisualDrag() {
        if (!drag || drag.moved) return;
        drag.moved = true;
        const rect = drag.el.getBoundingClientRect();

        const placeholder = document.createElement('div');
        placeholder.className = 'tab-placeholder';
        placeholder.style.width = rect.width + 'px';
        drag.el.parentNode.insertBefore(placeholder, drag.el);
        drag.placeholder = placeholder;

        drag.el.classList.add('dragging');
        drag.el.style.opacity = '0';
        tabsList.classList.add('drag-active');

        window.api.dragStart(rect.width, rect.height, drag.tabTitle);

        drag.hoverHandler = function(data) {
            if (!drag) return;
            drag.targetWindowId = data.targetId;
            if (data.targetId) drag.detached = true;
        };
        window.api.onDragHover(drag.hoverHandler);
    }

    function onPointerMove(e) {
        if (!drag) return;
        drag.currentX = e.clientX;
        drag.currentY = e.clientY;

        if (!drag.moved) {
            const dx = e.clientX - drag.startX;
            const dy = e.clientY - drag.startY;
            if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
            beginVisualDrag();
        }

        if (drag.detached || drag.targetWindowId) return;

        const dy = e.clientY - drag.startY;
        if (dy > DETACH_Y_THRESHOLD) {
            drag.detached = true;
            return;
        }

        updatePlaceholderPosition();
    }

    function updatePlaceholderPosition() {
        if (!drag || !drag.placeholder) return;
        const x = drag.currentX;
        const items = Array.from(tabsList.querySelectorAll('.tab')).filter(function(t) { return t !== drag.el; });
        let refNode = null;
        for (let i = 0; i < items.length; i++) {
            const t = items[i];
            const r = t.getBoundingClientRect();
            if (x < r.left + r.width / 2) { refNode = t; break; }
        }
        if (refNode) {
            if (refNode.previousSibling !== drag.placeholder) tabsList.insertBefore(drag.placeholder, refNode);
        } else {
            const last = items[items.length - 1];
            if (last && drag.placeholder.previousSibling !== last) {
                if (drag.placeholder !== last.nextSibling) tabsList.appendChild(drag.placeholder);
            } else if (!last) {
                if (drag.placeholder.parentNode !== tabsList) tabsList.appendChild(drag.placeholder);
            }
        }
    }

    async function onPointerUp() {
        if (!drag) return;
        const d = drag;
        document.removeEventListener('pointermove', d.__moveHandler);
        document.removeEventListener('pointerup', d.__upHandler);
        document.removeEventListener('pointercancel', d.__upHandler);
        window.api.dragEnd();

        if (!d.moved) {
            drag = null;
            d.el.style.opacity = '';
            d.el.classList.remove('dragging');
            switchTab(d.id);
            return;
        }

        if (d.targetWindowId) return transferTabToWindow(d);
        if (d.detached) return detachTabToNewWindow(d);

        const fromIndex = tabs.findIndex(function(t) { return t.id === d.id; });
        const children = Array.from(tabsList.children);
        let newIndex = children.indexOf(d.placeholder);
        if (newIndex === -1) newIndex = fromIndex;

        if (fromIndex !== -1 && newIndex !== -1 && fromIndex !== newIndex) {
            const moved = tabs.splice(fromIndex, 1)[0];
            tabs.splice(Math.min(newIndex, tabs.length), 0, moved);
        }

        d.el.style.opacity = '';
        d.el.classList.remove('dragging');
        if (d.placeholder && d.placeholder.parentNode) d.placeholder.remove();
        tabsList.classList.remove('drag-active');
        drag = null;
        updateTabsUI();
    }

    async function transferTabToWindow(d) {
        const tab = tabs.find(function(t) { return t.id === d.id; });
        if (!tab) { drag = null; updateTabsUI(); return; }

        const isLastTab = tabs.length === 1;
        const fromIndex = tabs.findIndex(function(t) { return t.id === d.id; });

        tab.observer.disconnect();
        tab.term.dispose();
        tab.container.remove();
        tabs.splice(fromIndex, 1);
        if (d.placeholder && d.placeholder.parentNode) d.placeholder.remove();
        tabsList.classList.remove('drag-active');

        if (activeTabId === d.id) {
            if (tabs.length > 0) {
                activeTabId = tabs[Math.min(fromIndex, tabs.length - 1)].id;
                tabs.forEach(function(t) { t.container.classList.toggle('active', t.id === activeTabId); });
            } else activeTabId = null;
        }

        drag = null;
        updateTabsUI();

        window.api.transferPty(tab.ptyId, tab.title, d.targetWindowId);

        if (isLastTab) {
            setTimeout(function() { window.api.close(); }, 30);
        }
    }

    async function detachTabToNewWindow(d) {
        if (tabs.length <= 1) {
            d.el.style.opacity = '';
            d.el.classList.remove('dragging');
            if (d.placeholder && d.placeholder.parentNode) d.placeholder.remove();
            tabsList.classList.remove('drag-active');
            drag = null;
            updateTabsUI();
            return;
        }
        const tab = tabs.find(function(t) { return t.id === d.id; });
        if (!tab) { drag = null; updateTabsUI(); return; }
        const bounds = await window.api.getBounds();
        tab.observer.disconnect();
        tab.term.dispose();
        tab.container.remove();
        const fromIndex = tabs.findIndex(function(t) { return t.id === d.id; });
        tabs.splice(fromIndex, 1);
        if (d.placeholder && d.placeholder.parentNode) d.placeholder.remove();
        tabsList.classList.remove('drag-active');
        if (activeTabId === d.id) {
            if (tabs.length > 0) {
                activeTabId = tabs[Math.min(fromIndex, tabs.length - 1)].id;
                tabs.forEach(function(t) { t.container.classList.toggle('active', t.id === activeTabId); });
            } else activeTabId = null;
        }
        drag = null;
        updateTabsUI();
        window.api.newArtificialWindowWithPty(tab.ptyId, tab.title, {
            x: bounds.x + 60, y: bounds.y + 60,
            width: bounds.width, height: bounds.height
        });
    }

    function switchTab(id) {
        const tab = tabs.find(function(t) { return t.id === id; });
        if (!tab) return;
        activeTabId = id;
        tabs.forEach(function(t) { t.container.classList.toggle('active', t.id === id); });
        updateTabsUI();
        tab.term.focus();
        setTimeout(function() { tab.doFit(); }, 10);
    }

    function createTab(existingPtyId, explicitTitle) {
        if (tabs.length >= MAX_TABS) return null;
        const id = existingPtyId || generatePtyId();
        const title = explicitTitle || 'Terminal ' + getNextAvailableNumber();
        const theme = getActiveTermTheme();
        const inst = createTerminalInstance(theme);
        const term = inst.term;
        const doFit = inst.doFit;
        const container = inst.container;
        const observer = inst.observer;
        const searchAddon = inst.searchAddon;

        container.dataset.id = id;
        const tabData = { id: id, title: title, term: term, doFit: doFit, container: container, observer: observer, searchAddon: searchAddon, ptyId: id };
        tabs.push(tabData);
        bindInput(term, id);
        if (existingPtyId) window.api.reattachPty(id);
        else window.api.createPty(id, term.cols, term.rows);
        switchTab(id);
        if (manager.onTabCreated) manager.onTabCreated(term);
        return tabData;
    }

    function adoptTab(ptyId, title) {
        if (tabs.find(function(t) { return t.id === ptyId; })) return;
        createTab(ptyId, title);
    }

    function closeTab(id) {
        const index = tabs.findIndex(function(t) { return t.id === id; });
        if (index === -1) return;
        const tab = tabs[index];
        window.api.killPty(tab.ptyId);
        tab.observer.disconnect();
        tab.term.dispose();
        tab.container.remove();
        tabs.splice(index, 1);
        if (activeTabId === id) {
            if (tabs.length > 0) switchTab(tabs[Math.min(index, tabs.length - 1)].id);
            else { activeTabId = null; updateTabsUI(); }
        } else updateTabsUI();
    }

    function updateTheme(theme) {
        tabs.forEach(function(tab) { try { Object.assign(tab.term.options.theme, theme); } catch (e) {} });
    }

    btnNewTab.onclick = function() { createTab(); };
    if (initialPtyId) createTab(initialPtyId, initialTitle);
    else if (skipAutoCreate) updateTabsUI();
    else createTab();

    manager.createTab = createTab;
    manager.adoptTab = adoptTab;
    manager.switchTab = switchTab;
    manager.closeTab = closeTab;
    manager.updateTheme = updateTheme;
    manager.getActiveTerminal = function() {
        const tab = tabs.find(function(t) { return t.id === activeTabId; });
        return tab ? tab.term : null;
    };
    manager.getActiveSearchAddon = function() {
        const tab = tabs.find(function(t) { return t.id === activeTabId; });
        return tab ? tab.searchAddon : null;
    };
    manager.getActivePtyId = function() {
        const tab = tabs.find(function(t) { return t.id === activeTabId; });
        return tab ? tab.ptyId : null;
    };
    return manager;
}