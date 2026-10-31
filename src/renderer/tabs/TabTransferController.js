class TabTransferController {
    constructor({ getTabs, removeTab, transferPty, closeWindow }) {
        this._getTabs = getTabs;
        this._removeTab = removeTab;
        this._transferPty = transferPty;
        this._closeWindow = closeWindow;
    }

    transfer(tab, targetWindowId) {
        const tabs = this._getTabs();
        const isLastTab = tabs.length === 1;

        this._removeTab(tab.id);
        this._transferPty(tab.ptyId, tab.title, targetWindowId);

        if (isLastTab) {
            setTimeout(() => this._closeWindow(), 30);
        }
    }
}

export { TabTransferController };