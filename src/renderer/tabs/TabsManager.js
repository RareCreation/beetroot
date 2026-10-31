import { createTerminalInstance } from '../terminal/TerminalInstanceFactory.js';
import { bindInput } from '../terminal/TerminalInputBinder.js';
import { createKeyEventInterceptor } from '../terminal/TerminalKeyEventInterceptor.js';
import { getActiveTermTheme } from '../theme/ThemeManager.js';
import { TabModel } from './TabModel.js';
import { TabViewRenderer } from './TabViewRenderer.js';
import { TabRenameController } from './TabRenameController.js';
import { TabDragController } from './TabDragController.js';
import { TabDetachController } from './TabDetachController.js';
import { TabTransferController } from './TabTransferController.js';

const MAX_TABS = 10;

function createTabsManager(initialPtyId, initialTitle, skipAutoCreate) {
    const tabsList = document.getElementById('tabs-list');
    const btnNewTab = document.getElementById('btn-new-tab');
    const emptyState = document.getElementById('empty-state');

    let tabs = [];
    let activeTabId = null;

    const manager = {};

    function generatePtyId() {
        return 'pty-' + Math.random().toString(36).substr(2, 9);
    }

    function getNextAvailableNumber() {
        const used = new Set();
        for (const tab of tabs) {
            const match = tab.title.match(/^Terminal (\d+)$/);
            if (match) used.add(Number(match[1]));
        }
        let n = 1;
        while (used.has(n)) n++;
        return n;
    }

    function updateEmptyState() {
        if (emptyState) emptyState.classList.toggle('hidden', tabs.length > 0);
    }

    function updateNewTabButton() {
        if (!btnNewTab) return;
        const full = tabs.length >= MAX_TABS;
        btnNewTab.disabled = full;
        btnNewTab.classList.toggle('disabled', full);
    }

    function updateTabsUI() {
        viewRenderer.render(tabs, activeTabId);
        updateEmptyState();
        updateNewTabButton();
    }

    function findTab(id) {
        return tabs.find((t) => t.id === id) || null;
    }

    function findActiveTab() {
        return findTab(activeTabId);
    }

    function switchTab(id) {
        const tab = findTab(id);
        if (!tab) return;

        activeTabId = id;
        for (const t of tabs) {
            t.container.classList.toggle('active', t.id === id);
        }
        updateTabsUI();
        tab.term.focus();
        setTimeout(() => tab.doFit(), 10);
    }

    function switchToOffset(offset) {
        if (tabs.length === 0) return;
        const index = tabs.findIndex((t) => t.id === activeTabId);
        if (index === -1) return;
        const next = (index + offset + tabs.length) % tabs.length;
        switchTab(tabs[next].id);
    }

    function switchToNextTab() {
        switchToOffset(1);
    }

    function switchToPreviousTab() {
        switchToOffset(-1);
    }

    function removeTabInternal(id) {
        const index = tabs.findIndex((t) => t.id === id);
        if (index === -1) return null;

        const tab = tabs[index];
        tab.dispose();
        tabs.splice(index, 1);

        if (activeTabId === id) {
            if (tabs.length > 0) {
                activeTabId = tabs[Math.min(index, tabs.length - 1)].id;
                for (const t of tabs) {
                    t.container.classList.toggle('active', t.id === activeTabId);
                }
            } else {
                activeTabId = null;
            }
        }
        updateTabsUI();
        return tab;
    }

    function reorderTabs(fromIndex, toIndex) {
        const [moved] = tabs.splice(fromIndex, 1);
        tabs.splice(toIndex, 0, moved);
        updateTabsUI();
    }

    function createTab(existingPtyId, explicitTitle) {
        if (tabs.length >= MAX_TABS) return null;

        const id = existingPtyId || generatePtyId();
        const title = explicitTitle || 'Terminal ' + getNextAvailableNumber();
        const theme = getActiveTermTheme();

        const instance = createTerminalInstance(theme);
        const tab = new TabModel({
            id,
            title,
            term: instance.term,
            doFit: instance.doFit,
            container: instance.container,
            observer: instance.observer,
            searchAddon: instance.searchAddon,
            ptyId: id
        });

        tab.container.dataset.id = id;
        tabs.push(tab);

        bindInput(tab.term, id);

        if (existingPtyId) window.api.reattachPty(id);
        else window.api.createPty(id, tab.term.cols, tab.term.rows);

        switchTab(id);

        if (manager.onTabCreated) manager.onTabCreated(tab.term);

        tab.term.attachCustomKeyEventHandler(
            createKeyEventInterceptor({
                getTerminal: () => tab.term,
                searchController: {
                    open: () => manager.getSearchController && manager.getSearchController().open(),
                    close: () => manager.getSearchController && manager.getSearchController().close(),
                    isOpen: () => !!(manager.getSearchController && manager.getSearchController().isOpen())
                }
            })
        );

        return tab;
    }

    function adoptTab(ptyId, title) {
        if (findTab(ptyId)) return;
        createTab(ptyId, title);
    }

    function closeTab(id) {
        const tab = findTab(id);
        if (!tab) return;
        window.api.killPty(tab.ptyId);
        removeTabInternal(id);
    }

    function updateTheme(theme) {
        for (const tab of tabs) {
            try { Object.assign(tab.term.options.theme, theme); } catch (_) {}
        }
    }

    const viewRenderer = new TabViewRenderer({
        tabsList,
        onSelect: switchTab,
        onClose: closeTab,
        onDetach: async (tab) => {
            const ok = await detachController.detachToBackground(tab);
            if (ok && manager.onSessionChange) manager.onSessionChange();
        },
        onPointerDown: (event, id, el) => dragController.handlePointerDown(event, id, el),
        onContextMenu: (event, tab) => renameController.start(tab)
    });

    const renameController = new TabRenameController({
        viewRenderer,
        onCommit: () => updateTabsUI()
    });

    const dragController = new TabDragController({
        tabsList,
        getTabs: () => tabs,
        onReorder: reorderTabs,
        onTransfer: (tab, targetWindowId) => transferController.transfer(tab, targetWindowId),
        onDetach: (tab) => {
            detachController.detachToNewWindow(tab);
        },
        onSelect: switchTab
    });

    const detachController = new TabDetachController({
        getTabs: () => tabs,
        removeTab: removeTabInternal,
        getBounds: () => window.api.getBounds(),
        createArtificialWindow: (ptyId, title, bounds) =>
            window.api.newArtificialWindowWithPty(ptyId, title, bounds)
    });

    const transferController = new TabTransferController({
        getTabs: () => tabs,
        removeTab: removeTabInternal,
        transferPty: (ptyId, title, targetWebContentsId) =>
            window.api.transferPty(ptyId, title, targetWebContentsId),
        closeWindow: () => window.api.close()
    });

    function startRenameActiveTab() {
        const tab = findActiveTab();
        if (!tab) return;
        renameController.start(tab);
    }

    btnNewTab.onclick = () => createTab();

    if (initialPtyId) createTab(initialPtyId, initialTitle);
    else if (skipAutoCreate) updateTabsUI();
    else createTab();

    manager.createTab = createTab;
    manager.adoptTab = adoptTab;
    manager.switchTab = switchTab;
    manager.switchToNextTab = switchToNextTab;
    manager.switchToPreviousTab = switchToPreviousTab;
    manager.startRenameActiveTab = startRenameActiveTab;
    manager.closeTab = closeTab;
    manager.updateTheme = updateTheme;
    manager.getActiveTerminal = () => {
        const tab = findActiveTab();
        return tab ? tab.term : null;
    };
    manager.getActiveSearchAddon = () => {
        const tab = findActiveTab();
        return tab ? tab.searchAddon : null;
    };
    manager.getActivePtyId = () => {
        const tab = findActiveTab();
        return tab ? tab.ptyId : null;
    };

    return manager;
}

export { createTabsManager };