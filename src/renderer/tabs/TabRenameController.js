class TabRenameController {
    constructor({ viewRenderer, onCommit }) {
        this._viewRenderer = viewRenderer;
        this._onCommit = onCommit;
    }

    start(tab) {
        const el = this._viewRenderer.findElement(tab.id);
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

        requestAnimationFrame(() => {
            input.focus();
            input.select();
        });

        let finished = false;

        const commit = (save) => {
            if (finished) return;
            finished = true;

            const value = input.value.trim();
            if (save && value && value !== oldTitle) {
                tab.setTitle(value);
            }

            el.classList.remove('renaming');
            titleEl.style.display = '';
            titleEl.textContent = tab.title;

            if (input.parentNode) input.remove();
            if (save && this._onCommit) this._onCommit(tab);
        };

        input.addEventListener('keydown', (event) => {
            event.stopPropagation();
            if (event.key === 'Enter') {
                event.preventDefault();
                commit(true);
            } else if (event.key === 'Escape') {
                event.preventDefault();
                commit(false);
            }
        });
        input.addEventListener('blur', () => commit(true));
        input.addEventListener('pointerdown', (event) => event.stopPropagation());
        input.addEventListener('mousedown', (event) => event.stopPropagation());
        input.addEventListener('click', (event) => event.stopPropagation());
    }
}

export { TabRenameController };