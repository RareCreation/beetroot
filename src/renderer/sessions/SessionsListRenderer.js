class SessionsListRenderer {
    constructor({ container, onRestore, onKill }) {
        this._container = container;
        this._onRestore = onRestore;
        this._onKill = onKill;
    }

    render(sessions) {
        this._container.innerHTML = '';

        if (!sessions || sessions.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'clipboard-empty';
            empty.textContent = 'No background sessions';
            this._container.appendChild(empty);
            return;
        }

        for (const session of sessions) {
            const el = document.createElement('div');
            el.className = 'clipboard-item';

            const textEl = document.createElement('span');
            textEl.className = 'clipboard-item-text';
            textEl.textContent = session.title;
            textEl.title = session.id;
            el.appendChild(textEl);

            const restoreBtn = document.createElement('button');
            restoreBtn.className = 'clipboard-dot';
            restoreBtn.style.background = '#5ad6c0';
            restoreBtn.title = 'Restore to Tab';
            restoreBtn.onclick = (event) => {
                event.stopPropagation();
                this._onRestore(session);
            };
            el.appendChild(restoreBtn);

            const killBtn = document.createElement('button');
            killBtn.className = 'clipboard-dot';
            killBtn.style.background = '#ff5f57';
            killBtn.title = 'Kill Process';
            killBtn.onclick = (event) => {
                event.stopPropagation();
                this._onKill(session);
            };
            el.appendChild(killBtn);

            this._container.appendChild(el);
        }
    }
}

export { SessionsListRenderer };