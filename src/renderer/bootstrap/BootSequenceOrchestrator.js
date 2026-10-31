import { WindowKindResolver } from './WindowKindResolver.js';
import { RendererErrorBoundary } from '../core/RendererErrorBoundary.js';
import { DomSelectorRegistry } from '../core/DomSelectorRegistry.js';
import { KeyboardShortcutRegistry } from '../core/KeyboardShortcutRegistry.js';
import { createTabsManager } from '../tabs/TabsManager.js';
import { buildThemeList } from '../theme/ThemeListRenderer.js';
import { init as initClipboard } from '../clipboard/ClipboardView.js';
import { init as initPanels } from '../panels/PanelController.js';
import { init as initWindowControls } from '../window/WindowControls.js';
import { init as initResize } from '../window/WindowResizeController.js';
import { init as initSearch } from '../search/SearchController.js';
import { init as initSessions } from '../sessions/SessionsController.js';
import { ToastNotifier } from '../notifications/ToastNotifier.js';

class BootSequenceOrchestrator {
    constructor() {
        this._kindResolver = new WindowKindResolver();
        this._selectors = new DomSelectorRegistry();
        this._shortcuts = new KeyboardShortcutRegistry();
        this._tabsManager = null;
        this._pendingInit = undefined;
        this._booted = false;
        this._toast = new ToastNotifier({ containerId: 'toast-container' });
    }

    start() {
        this._kindResolver.bind();

        window.api.onWindowInit((data) => {
            if (this._tabsManager) {
                if (data.ptyId) this._tabsManager.adoptTab(data.ptyId, data.title || null);
            } else {
                this._pendingInit = data;
                this._tryBoot();
            }
        });

        window.api.onAdopt((data) => {
            if (this._tabsManager) this._tabsManager.adoptTab(data.ptyId, data.title || null);
        });

        this._kindResolver.onResolved(() => this._tryBoot());
    }

    _tryBoot() {
        if (this._booted) return;
        if (!this._kindResolver.isResolved()) return;
        this._booted = true;
        this._boot(this._kindResolver.getKind());
    }

    _boot(kind) {
        const isNative = kind === 'native';

        if (isNative) {
            this._tabsManager = createTabsManager();
        } else if (this._pendingInit && this._pendingInit.ptyId) {
            this._tabsManager = createTabsManager(undefined, undefined, true);
            this._tabsManager.adoptTab(this._pendingInit.ptyId, this._pendingInit.title || null);
        } else {
            this._tabsManager = createTabsManager(null, null, true);
        }

        this._pendingInit = undefined;

        const getActiveTerm = () => this._tabsManager.getActiveTerminal();

        const errorBoundary = new RendererErrorBoundary({ getActiveTerminal: getActiveTerm });
        errorBoundary.install();

        setTimeout(() => {
            const term = getActiveTerm();
            if (term) {
                window.api.resize(term.cols, term.rows);
                term.focus();
            }
        }, 100);

        initClipboard(() => getActiveTerm());

        const panels = initPanels();
        initWindowControls();
        initResize();

        const searchController = initSearch({
            getTerminal: () => getActiveTerm(),
            getSearchAddon: () => this._tabsManager.getActiveSearchAddon()
        });

        this._tabsManager.getSearchController = () => searchController;

        initSessions({
            onRestore: (id, title) => this._tabsManager.adoptTab(id, title)
        });

        this._tabsManager.onSessionChange = () => {
            const sessionsRefresh = window.__sessionsRefresh;
            if (typeof sessionsRefresh === 'function') sessionsRefresh();
            this._toast.show('Session detached to background', () => {
                const btn = document.getElementById('btn-sessions');
                if (btn) btn.click();
            });
        };

        document.getElementById('btn-settings').onclick = () => panels.openSettings();
        document.getElementById('settings-close').onclick = () => panels.closeSettings();

        document.getElementById('btn-clipboard').onclick = async () => {
            const wasHidden = panels.toggleClipboard();
            if (wasHidden) {
                const clipboardRefresh = window.__clipboardRefresh;
                if (typeof clipboardRefresh === 'function') await clipboardRefresh();
            }
        };
        document.getElementById('clipboard-close').onclick = () => panels.closeClipboard();

        document.addEventListener('mousedown', (event) => panels.handleOutsideClick(event));

        document.getElementById('terminals-container').addEventListener('contextmenu', (event) => {
            event.preventDefault();
            const term = getActiveTerm();
            if (!term) return;

            if (term.hasSelection()) {
                window.api.writeClipboard(term.getSelection());
                term.clearSelection();
            } else {
                window.api.readClipboard().then((text) => {
                    if (text) term.paste(text);
                });
            }
        });

        document.addEventListener('mousedown', (event) => {
            if (event.target.closest('#sessions-panel') || event.target.closest('#btn-sessions')) return;
            const term = getActiveTerm();
            if (term) setTimeout(() => term.focus(), 0);
        });

        window.addEventListener('focus', () => {
            const term = getActiveTerm();
            if (term) {
                term.focus();
                term.options.cursorBlink = true;
            }
        });

        window.addEventListener('blur', () => {
            const term = getActiveTerm();
            if (term) term.options.cursorBlink = false;
        });

        buildThemeList();
        this._tabsManager.updateTheme(undefined);

        this._registerGlobalShortcuts();

        setTimeout(() => {
            const term = getActiveTerm();
            if (term) term.focus();
            const sessionsRefresh = window.__sessionsRefresh;
            if (typeof sessionsRefresh === 'function') sessionsRefresh();
        }, 50);
    }

    _registerGlobalShortcuts() {
        const tabs = this._tabsManager;

        this._shortcuts.register({
            key: 't',
            ctrl: true,
            shift: true,
            handler: () => tabs.createTab()
        });

        this._shortcuts.register({
            key: 'w',
            ctrl: true,
            shift: true,
            handler: () => {
                const id = tabs.getActivePtyId();
                if (id) tabs.closeTab(id);
            }
        });

        this._shortcuts.register({
            key: 'tab',
            ctrl: true,
            shift: false,
            handler: () => tabs.switchToNextTab()
        });

        this._shortcuts.register({
            key: 'tab',
            ctrl: true,
            shift: true,
            handler: () => tabs.switchToPreviousTab()
        });

        this._shortcuts.register({
            key: 'f2',
            ctrl: false,
            shift: false,
            handler: () => tabs.startRenameActiveTab()
        });

        this._shortcuts.install();
    }
}

export { BootSequenceOrchestrator };