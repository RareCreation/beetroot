class CustomScrollbar {
    constructor({ container, className = 'custom-scrollbar' } = {}) {
        this._container = container;
        this._className = className;
        this._track = null;
        this._thumb = null;
        this._visible = false;
        this._dragging = false;
        this._dragStartY = 0;
        this._dragStartScroll = 0;
        this._hideTimer = null;
        this._installed = false;

        this._onScroll = () => this._syncThumb();
        this._onResize = () => this._syncThumb();
        this._onEnter = () => this._show();
        this._onLeave = () => this._scheduleHide();
        this._onThumbDown = (event) => this._startDrag(event);
        this._onThumbMove = (event) => this._moveDrag(event);
        this._onThumbUp = () => this._endDrag();
    }

    install() {
        if (this._installed) return;
        this._installed = true;

        const track = document.createElement('div');
        track.className = this._className;
        track.innerHTML = '<div class="custom-scrollbar-thumb"></div>';

        const parent = this._container.parentElement;
        if (parent) {
            parent.style.position = parent.style.position || 'relative';
            parent.appendChild(track);
        } else {
            this._container.appendChild(track);
        }

        this._track = track;
        this._thumb = track.querySelector('.custom-scrollbar-thumb');

        this._container.addEventListener('scroll', this._onScroll, { passive: true });
        this._container.addEventListener('mouseenter', this._onEnter);
        this._container.addEventListener('mouseleave', this._onLeave);
        window.addEventListener('resize', this._onResize);

        this._thumb.addEventListener('pointerdown', this._onThumbDown);

        this._syncThumb();
    }

    _show() {
        if (this._hideTimer) {
            clearTimeout(this._hideTimer);
            this._hideTimer = null;
        }
        if (!this._visible) {
            this._visible = true;
            this._track.classList.add('visible');
        }
        this._syncThumb();
    }

    _scheduleHide() {
        if (this._dragging) return;
        if (this._hideTimer) clearTimeout(this._hideTimer);
        this._hideTimer = setTimeout(() => {
            this._visible = false;
            this._track.classList.remove('visible');
            this._hideTimer = null;
        }, 600);
    }

    _syncThumb() {
        if (!this._track || !this._thumb) return;

        const el = this._container;
        const trackHeight = el.clientHeight;
        const contentHeight = el.scrollHeight;

        if (contentHeight <= trackHeight + 1) {
            this._track.classList.add('hidden');
            return;
        }
        this._track.classList.remove('hidden');

        const ratio = trackHeight / contentHeight;
        const thumbHeight = Math.max(28, Math.round(trackHeight * ratio));
        const maxScroll = contentHeight - trackHeight;
        const scrollRatio = maxScroll > 0 ? el.scrollTop / maxScroll : 0;
        const maxThumbTop = trackHeight - thumbHeight;
        const thumbTop = Math.round(maxThumbTop * scrollRatio);

        this._thumb.style.height = thumbHeight + 'px';
        this._thumb.style.transform = `translateY(${thumbTop}px)`;
    }

    _startDrag(event) {
        event.preventDefault();
        this._dragging = true;
        this._dragStartY = event.clientY;
        this._dragStartScroll = this._container.scrollTop;
        this._thumb.classList.add('dragging');
        this._thumb.setPointerCapture(event.pointerId);
        this._thumb.addEventListener('pointermove', this._onThumbMove);
        this._thumb.addEventListener('pointerup', this._onThumbUp);
        this._thumb.addEventListener('pointercancel', this._onThumbUp);
    }

    _moveDrag(event) {
        if (!this._dragging) return;

        const el = this._container;
        const trackHeight = el.clientHeight;
        const contentHeight = el.scrollHeight;
        const thumbHeight = this._thumb.offsetHeight;
        const maxThumbTop = trackHeight - thumbHeight;
        const maxScroll = contentHeight - trackHeight;
        if (maxThumbTop <= 0 || maxScroll <= 0) return;

        const delta = event.clientY - this._dragStartY;
        const scrollDelta = (delta / maxThumbTop) * maxScroll;
        el.scrollTop = this._dragStartScroll + scrollDelta;
    }

    _endDrag() {
        this._dragging = false;
        this._thumb.classList.remove('dragging');
        this._thumb.removeEventListener('pointermove', this._onThumbMove);
        this._thumb.removeEventListener('pointerup', this._onThumbUp);
        this._thumb.removeEventListener('pointercancel', this._onThumbUp);
        this._scheduleHide();
    }

    dispose() {
        if (!this._installed) return;
        this._installed = false;
        this._container.removeEventListener('scroll', this._onScroll);
        this._container.removeEventListener('mouseenter', this._onEnter);
        this._container.removeEventListener('mouseleave', this._onLeave);
        window.removeEventListener('resize', this._onResize);
        if (this._track && this._track.parentNode) this._track.parentNode.removeChild(this._track);
        this._track = null;
        this._thumb = null;
    }
}

export { CustomScrollbar };