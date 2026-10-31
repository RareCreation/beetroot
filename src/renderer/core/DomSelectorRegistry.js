const SELECTORS = Object.freeze({
    window: '#window',
    titlebar: '#titlebar',
    title: '#title',
    btnClose: '#btn-close',
    btnMin: '#btn-min',
    btnMax: '#btn-max',
    btnSessions: '#btn-sessions',
    btnClipboard: '#btn-clipboard',
    btnSettings: '#btn-settings',
    sessionsBadge: '#sessions-badge',
    tabsBar: '#tabs-bar',
    tabsList: '#tabs-list',
    btnNewTab: '#btn-new-tab',
    frame: '#frame',
    terminalsContainer: '#terminals-container',
    emptyState: '#empty-state',
    searchBar: '#search-bar',
    searchInput: '#search-input',
    searchResults: '#search-results',
    searchPrev: '#search-prev',
    searchNext: '#search-next',
    searchClose: '#search-close',
    settingsPanel: '#settings',
    settingsClose: '#settings-close',
    themeList: '#theme-list',
    customPalette: '#custom-palette',
    cpBase: '#cp-base',
    clipboardPanel: '#clipboard-panel',
    clipboardClose: '#clipboard-close',
    clipboardPinned: '#clipboard-pinned',
    clipboardLast: '#clipboard-last',
    sessionsPanel: '#sessions-panel',
    sessionsClose: '#sessions-close',
    sessionsList: '#sessions-list',
    toastContainer: '#toast-container'
});

class DomSelectorRegistry {
    constructor() {
        this._cache = new Map();
    }

    get(key) {
        if (this._cache.has(key)) return this._cache.get(key);
        const selector = SELECTORS[key];
        if (!selector) return null;
        const element = document.querySelector(selector);
        if (element) this._cache.set(key, element);
        return element;
    }

    getSelector(key) {
        return SELECTORS[key] || null;
    }

    invalidate(key) {
        if (key) this._cache.delete(key);
        else this._cache.clear();
    }
}

export { DomSelectorRegistry, SELECTORS };