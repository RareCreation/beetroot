class SearchBarView {
    constructor() {
        this._bar = document.getElementById('search-bar');
        this._input = document.getElementById('search-input');
        this._results = document.getElementById('search-results');
        this._prev = document.getElementById('search-prev');
        this._next = document.getElementById('search-next');
        this._close = document.getElementById('search-close');
    }

    show() {
        this._bar.classList.remove('hidden');
    }

    hide() {
        this._bar.classList.add('hidden');
    }

    focusInput() {
        this._input.focus();
        this._input.select();
    }

    resetInput() {
        this._input.value = '';
    }

    getInputValue() {
        return this._input.value;
    }

    updateResults(found, total, hasQuery) {
        this._results.textContent = total > 0 ? `${found}/${total}` : '0/0';
        this._results.classList.toggle('no-results', total === 0 && !!hasQuery);

        const hasResults = total > 0;
        this._prev.disabled = !hasResults;
        this._next.disabled = !hasResults;
    }

    bindEvents({ onInput, onKeyDown, onPrev, onNext, onClose }) {
        this._input.addEventListener('input', onInput);
        this._input.addEventListener('keydown', onKeyDown);
        this._prev.addEventListener('click', onPrev);
        this._next.addEventListener('click', onNext);
        this._close.addEventListener('click', onClose);
        this._bar.addEventListener('keydown', (event) => event.stopPropagation());
        this._bar.addEventListener('mousedown', (event) => event.stopPropagation());
    }
}

export { SearchBarView };