class TabDetachController {
    constructor({ getTabs, removeTab, getBounds, createArtificialWindow }) {
        this._getTabs = getTabs;
        this._removeTab = removeTab;
        this._getBounds = getBounds;
        this._createArtificialWindow = createArtificialWindow;
    }

    async detachToNewWindow(tab) {
        const tabs = this._getTabs();
        if (tabs.length <= 1) return false;

        const bounds = await this._getBounds();
        this._removeTab(tab.id);

        this._createArtificialWindow(tab.ptyId, tab.title, {
            x: bounds.x + 60,
            y: bounds.y + 60,
            width: bounds.width,
            height: bounds.height
        });
        return true;
    }

    async detachToBackground(tab) {
        const ok = await window.api.detachPty(tab.id, tab.title);
        if (!ok) return false;
        this._removeTab(tab.id);
        return true;
    }
}

export { TabDetachController };