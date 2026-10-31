import { SessionsListRenderer } from './SessionsListRenderer.js';
import { SessionsBadgeController } from './SessionsBadgeController.js';

let panelEl = null;
let listRenderer = null;
let badgeController = null;
let onRestoreCallback = null;

async function refresh() {
    if (!listRenderer) return;

    let sessions;
    try {
        sessions = await window.api.getDetachedPtys();
    } catch (_) {
        sessions = [];
    }

    badgeController.update(sessions.length);
    listRenderer.render(sessions);
}

function init({ onRestore }) {
    onRestoreCallback = onRestore;
    panelEl = document.getElementById('sessions-panel');

    listRenderer = new SessionsListRenderer({
        container: document.getElementById('sessions-list'),
        onRestore: async (session) => {
            try {
                const ok = await window.api.attachPty(session.id);
                if (ok && onRestoreCallback) onRestoreCallback(session.id, session.title);
            } catch (_) {}
            refresh();
        },
        onKill: async (session) => {
            window.api.killPty(session.id);
            setTimeout(refresh, 100);
        }
    });

    badgeController = new SessionsBadgeController({
        badgeElement: document.getElementById('sessions-badge')
    });

    document.getElementById('sessions-close').onclick = (event) => {
        event.stopPropagation();
        panelEl.classList.add('hidden');
    };

    const btn = document.getElementById('btn-sessions');

    btn.addEventListener('pointerdown', (event) => event.stopPropagation());
    btn.addEventListener('mousedown', (event) => event.stopPropagation());

    btn.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();

        document.getElementById('settings').classList.add('hidden');
        document.getElementById('clipboard-panel').classList.add('hidden');

        const isHidden = panelEl.classList.contains('hidden');
        if (isHidden) {
            panelEl.classList.remove('hidden');
            refresh();
        } else {
            panelEl.classList.add('hidden');
        }
    };

    document.addEventListener('pointerdown', (event) => {
        if (!panelEl.classList.contains('hidden')) {
            if (!panelEl.contains(event.target) && !event.target.closest('#btn-sessions')) {
                panelEl.classList.add('hidden');
            }
        }
    });

    refresh();
}

window.__sessionsRefresh = refresh;

export { init, refresh };