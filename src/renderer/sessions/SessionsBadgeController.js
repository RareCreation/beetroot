class SessionsBadgeController {
    constructor({ badgeElement }) {
        this._badge = badgeElement;
    }

    update(count) {
        if (!this._badge) return;
        if (count > 0) {
            this._badge.textContent = count;
            this._badge.classList.remove('hidden');
        } else {
            this._badge.classList.add('hidden');
        }
    }
}

export { SessionsBadgeController };