class TabModel {
    constructor({ id, title, term, doFit, container, observer, searchAddon, ptyId }) {
        this.id = id;
        this.title = title;
        this.term = term;
        this.doFit = doFit;
        this.container = container;
        this.observer = observer;
        this.searchAddon = searchAddon;
        this.ptyId = ptyId;
    }

    setTitle(title) {
        this.title = title;
    }

    dispose() {
        try { this.observer.disconnect(); } catch (_) {}
        try { this.term.dispose(); } catch (_) {}
        try { this.container.remove(); } catch (_) {}
    }

    activate() {
        this.container.classList.add('active');
    }

    deactivate() {
        this.container.classList.remove('active');
    }
}

export { TabModel };