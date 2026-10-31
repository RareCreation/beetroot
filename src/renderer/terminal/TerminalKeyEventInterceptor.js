function createKeyEventInterceptor({ getTerminal, searchController }) {
    return function handleKeyEvent(event) {
        if (event.type !== 'keydown') return true;

        const term = getTerminal();
        if (!term) return true;

        const key = event.key.toLowerCase();

        if (event.ctrlKey && key === 'c' && term.hasSelection()) {
            window.api.writeClipboard(term.getSelection());
            term.clearSelection();
            return false;
        }

        if (event.ctrlKey && key === 'v') {
            event.preventDefault();
            event.stopPropagation();
            window.api.readClipboard().then((text) => {
                if (text) term.paste(text);
            });
            return false;
        }

        if (event.ctrlKey && key === 'f') {
            event.preventDefault();
            event.stopPropagation();
            searchController.open();
            return false;
        }

        if (key === 'escape' && searchController.isOpen()) {
            event.preventDefault();
            event.stopPropagation();
            searchController.close();
            return false;
        }

        return true;
    };
}

export { createKeyEventInterceptor };