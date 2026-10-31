import { SearchBarView } from './SearchBarView.js';
import { getDecorations } from './SearchDecorationProvider.js';

function init({ getTerminal, getSearchAddon }) {
    const view = new SearchBarView();
    let isOpen = false;
    let currentTerm = '';
    let resultsListener = null;

    function updateResultsDisplay(found, total) {
        view.updateResults(found, total, !!currentTerm);
    }

    function getAddon() {
        return getSearchAddon ? getSearchAddon() : null;
    }

    function doSearch(term, incremental) {
        currentTerm = term;
        const addon = getAddon();
        if (!addon) return;

        if (!term) {
            addon.clearDecorations();
            updateResultsDisplay(0, 0);
            return;
        }

        addon.findNext(term, {
            decorations: getDecorations(),
            incremental: !!incremental
        });
    }

    function findNext() {
        if (!currentTerm) return;
        const addon = getAddon();
        if (addon) addon.findNext(currentTerm, { decorations: getDecorations() });
    }

    function findPrevious() {
        if (!currentTerm) return;
        const addon = getAddon();
        if (addon) addon.findPrevious(currentTerm, { decorations: getDecorations() });
    }

    function open() {
        const term = getTerminal ? getTerminal() : null;
        if (!term) return;

        isOpen = true;
        view.show();
        view.resetInput();
        currentTerm = '';
        updateResultsDisplay(0, 0);

        const addon = getAddon();
        if (addon) {
            addon.clearDecorations();
            if (resultsListener) resultsListener.dispose();
            resultsListener = addon.onDidChangeResults((event) => {
                updateResultsDisplay(event.resultIndex + 1, event.resultCount);
            });
        }

        setTimeout(() => view.focusInput(), 50);
    }

    function close() {
        isOpen = false;
        view.hide();

        const addon = getAddon();
        if (addon) {
            if (resultsListener) {
                resultsListener.dispose();
                resultsListener = null;
            }
            addon.clearDecorations();
        }

        currentTerm = '';
        const term = getTerminal ? getTerminal() : null;
        if (term) term.focus();
    }

    function isOpenState() {
        return isOpen;
    }

    view.bindEvents({
        onInput: () => doSearch(view.getInputValue(), true),
        onKeyDown: (event) => {
            event.stopPropagation();
            if (event.key === 'Enter') {
                event.preventDefault();
                if (event.shiftKey) findPrevious();
                else findNext();
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                close();
            }
        },
        onPrev: findPrevious,
        onNext: findNext,
        onClose: close
    });

    return { open, close, isOpen: isOpenState };
}

export { init };