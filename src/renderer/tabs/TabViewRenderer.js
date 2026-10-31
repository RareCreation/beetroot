const DETACH_ICON_SVG = '<svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>';

class TabViewRenderer {
    constructor({ tabsList, onSelect, onClose, onDetach, onPointerDown, onContextMenu }) {
        this._tabsList = tabsList;
        this._onSelect = onSelect;
        this._onClose = onClose;
        this._onDetach = onDetach;
        this._onPointerDown = onPointerDown;
        this._onContextMenu = onContextMenu;
    }

    render(tabs, activeId) {
        this._tabsList.innerHTML = '';

        for (const tab of tabs) {
            const el = document.createElement('div');
            el.className = 'tab' + (tab.id === activeId ? ' active' : '');
            el.dataset.id = tab.id;

            const titleEl = document.createElement('span');
            titleEl.className = 'tab-title';
            titleEl.textContent = tab.title;
            el.appendChild(titleEl);

            const detachBtn = document.createElement('button');
            detachBtn.className = 'tab-detach';
            detachBtn.title = 'Move to Background';
            detachBtn.innerHTML = DETACH_ICON_SVG;
            detachBtn.onclick = (event) => {
                event.stopPropagation();
                this._onDetach(tab);
            };
            el.appendChild(detachBtn);

            const closeBtn = document.createElement('button');
            closeBtn.className = 'tab-close';
            closeBtn.innerHTML = '×';
            closeBtn.onclick = (event) => {
                event.stopPropagation();
                this._onClose(tab.id);
            };
            el.appendChild(closeBtn);

            el.addEventListener('pointerdown', (event) => {
                this._onPointerDown(event, tab.id, el);
            });

            el.addEventListener('contextmenu', (event) => {
                event.preventDefault();
                event.stopPropagation();
                this._onContextMenu(event, tab);
            });

            this._tabsList.appendChild(el);
        }
    }

    findElement(id) {
        return this._tabsList.querySelector('.tab[data-id="' + id + '"]');
    }
}

export { TabViewRenderer };