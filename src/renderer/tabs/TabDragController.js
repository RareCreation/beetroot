const DRAG_THRESHOLD = 5;
const DETACH_Y_THRESHOLD = 60;

class TabDragController {
    constructor({
                    tabsList,
                    getTabs,
                    onReorder,
                    onTransfer,
                    onDetach,
                    onSelect
                }) {
        this._tabsList = tabsList;
        this._getTabs = getTabs;
        this._onReorder = onReorder;
        this._onTransfer = onTransfer;
        this._onDetach = onDetach;
        this._onSelect = onSelect;
        this._drag = null;
        this._hoverListener = null;
    }

    handlePointerDown(event, id, el) {
        if (event.button !== 0) return;
        if (event.target.closest('.tab-close') || event.target.closest('.tab-detach')) return;
        if (event.target.classList && event.target.classList.contains('tab-rename-input')) return;
        if (this._drag) return;

        const titleEl = el.querySelector('.tab-title');
        const tabTitle = titleEl ? titleEl.textContent : 'Terminal';

        this._drag = {
            id,
            el,
            startX: event.clientX,
            startY: event.clientY,
            currentX: event.clientX,
            currentY: event.clientY,
            moved: false,
            detached: false,
            placeholder: null,
            targetWindowId: null,
            tabTitle
        };

        const moveHandler = (ev) => this._handlePointerMove(ev);
        const upHandler = () => this._handlePointerUp();

        this._drag.__moveHandler = moveHandler;
        this._drag.__upHandler = upHandler;

        document.addEventListener('pointermove', moveHandler);
        document.addEventListener('pointerup', upHandler);
        document.addEventListener('pointercancel', upHandler);
    }

    _beginVisualDrag() {
        const drag = this._drag;
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
        this._tabsList.classList.add('drag-active');

        window.api.dragStart(rect.width, rect.height, drag.tabTitle);

        this._hoverListener = (data) => {
            if (!this._drag) return;
            this._drag.targetWindowId = data.targetId;
        };
        window.api.onDragHover(this._hoverListener);
    }

    _handlePointerMove(event) {
        const drag = this._drag;
        if (!drag) return;

        drag.currentX = event.clientX;
        drag.currentY = event.clientY;

        if (!drag.moved) {
            const dx = event.clientX - drag.startX;
            const dy = event.clientY - drag.startY;
            if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
            this._beginVisualDrag();
        }

        if (drag.targetWindowId) return;

        const dy = event.clientY - drag.startY;
        const outsideWindow =
            dy > DETACH_Y_THRESHOLD ||
            event.clientY < 0 ||
            event.clientY > window.innerHeight ||
            event.clientX < 0 ||
            event.clientX > window.innerWidth;

        drag.detached = outsideWindow;

        if (drag.detached) return;

        this._updatePlaceholderPosition();
    }

    _updatePlaceholderPosition() {
        const drag = this._drag;
        if (!drag || !drag.placeholder) return;

        const x = drag.currentX;
        const items = Array.from(this._tabsList.querySelectorAll('.tab'))
            .filter((t) => t !== drag.el);

        let refNode = null;
        for (const t of items) {
            const r = t.getBoundingClientRect();
            if (x < r.left + r.width / 2) {
                refNode = t;
                break;
            }
        }

        if (refNode) {
            if (refNode.previousSibling !== drag.placeholder) {
                this._tabsList.insertBefore(drag.placeholder, refNode);
            }
            return;
        }

        const last = items[items.length - 1];
        if (last && drag.placeholder.previousSibling !== last) {
            if (drag.placeholder !== last.nextSibling) this._tabsList.appendChild(drag.placeholder);
        } else if (!last) {
            if (drag.placeholder.parentNode !== this._tabsList) this._tabsList.appendChild(drag.placeholder);
        }
    }

    _handlePointerUp() {
        const drag = this._drag;
        if (!drag) return;

        document.removeEventListener('pointermove', drag.__moveHandler);
        document.removeEventListener('pointerup', drag.__upHandler);
        document.removeEventListener('pointercancel', drag.__upHandler);

        window.api.dragEnd();

        if (!drag.moved) {
            this._drag = null;
            drag.el.style.opacity = '';
            drag.el.classList.remove('dragging');
            this._onSelect(drag.id);
            return;
        }

        if (drag.targetWindowId) {
            this._finalizeTransfer(drag);
            return;
        }

        if (drag.detached) {
            this._finalizeDetach(drag);
            return;
        }

        const tabs = this._getTabs();
        const fromIndex = tabs.findIndex((t) => t.id === drag.id);
        const children = Array.from(this._tabsList.children);
        let newIndex = children.indexOf(drag.placeholder);
        if (newIndex === -1) newIndex = fromIndex;

        drag.el.style.opacity = '';
        drag.el.classList.remove('dragging');
        if (drag.placeholder && drag.placeholder.parentNode) drag.placeholder.remove();
        this._tabsList.classList.remove('drag-active');
        this._drag = null;

        if (fromIndex !== -1 && newIndex !== -1 && fromIndex !== newIndex) {
            this._onReorder(fromIndex, Math.min(newIndex, tabs.length));
        }
    }

    _finalizeTransfer(drag) {
        const tabs = this._getTabs();
        const tab = tabs.find((t) => t.id === drag.id);
        if (!tab) {
            drag.el.style.opacity = '';
            drag.el.classList.remove('dragging');
            this._drag = null;
            return;
        }

        drag.el.style.opacity = '';
        drag.el.classList.remove('dragging');
        if (drag.placeholder && drag.placeholder.parentNode) drag.placeholder.remove();
        this._tabsList.classList.remove('drag-active');

        const targetWindowId = drag.targetWindowId;
        this._drag = null;
        this._onTransfer(tab, targetWindowId);
    }

    _finalizeDetach(drag) {
        const tabs = this._getTabs();
        const tab = tabs.find((t) => t.id === drag.id);
        if (!tab) {
            drag.el.style.opacity = '';
            drag.el.classList.remove('dragging');
            this._drag = null;
            return;
        }

        drag.el.style.opacity = '';
        drag.el.classList.remove('dragging');
        if (drag.placeholder && drag.placeholder.parentNode) drag.placeholder.remove();
        this._tabsList.classList.remove('drag-active');

        this._drag = null;
        this._onDetach(tab);
    }
}

export { TabDragController };