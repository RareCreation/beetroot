let panelEl = null;
let listEl = null;
let badgeEl = null;
let onChangeCallback = null;

async function refresh() {
    if (!listEl) {
        console.warn('[SESSIONS] refresh: listEl is null');
        return;
    }
    let detached;
    try {
        detached = await window.api.getDetachedPtys();
    } catch (e) {
        console.error('[SESSIONS] refresh getDetachedPtys failed:', e);
        detached = [];
    }
    console.log('[SESSIONS] refresh, detached=', detached);

    if (badgeEl) {
        if (detached.length > 0) {
            badgeEl.textContent = detached.length;
            badgeEl.classList.remove('hidden');
        } else {
            badgeEl.classList.add('hidden');
        }
    }

    listEl.innerHTML = '';
    if (!detached || detached.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'clipboard-empty';
        empty.textContent = 'No background sessions';
        listEl.appendChild(empty);
        return;
    }

    detached.forEach(function(session) {
        const el = document.createElement('div');
        el.className = 'clipboard-item';

        const textEl = document.createElement('span');
        textEl.className = 'clipboard-item-text';
        textEl.textContent = session.title;
        textEl.title = session.id;
        el.appendChild(textEl);

        const btnRestore = document.createElement('button');
        btnRestore.className = 'clipboard-dot';
        btnRestore.style.background = '#5ad6c0';
        btnRestore.title = 'Restore to Tab';
        btnRestore.onclick = async function(e) {
            e.stopPropagation();
            console.log('[SESSIONS] restore click', session.id);
            try {
                const r = await window.api.attachPty(session.id);
                console.log('[SESSIONS] attachPty result', r);
                if (r && onChangeCallback) onChangeCallback(session.id, session.title);
            } catch (err) {
                console.error('[SESSIONS] attachPty error:', err);
            }
            refresh();
        };
        el.appendChild(btnRestore);

        const btnKill = document.createElement('button');
        btnKill.className = 'clipboard-dot';
        btnKill.style.background = '#ff5f57';
        btnKill.title = 'Kill Process';
        btnKill.onclick = async function(e) {
            e.stopPropagation();
            console.log('[SESSIONS] kill click', session.id);
            window.api.killPty(session.id);
            setTimeout(refresh, 100);
        };
        el.appendChild(btnKill);

        listEl.appendChild(el);
    });
}

function init(onChange) {
    onChangeCallback = onChange;
    panelEl = document.getElementById('sessions-panel');
    listEl = document.getElementById('sessions-list');
    badgeEl = document.getElementById('sessions-badge');

    document.getElementById('sessions-close').onclick = function(e) {
        e.stopPropagation();
        panelEl.classList.add('hidden');
    };

    const btn = document.getElementById('btn-sessions');

    btn.addEventListener('pointerdown', function(e) {
        e.stopPropagation();
    });

    btn.addEventListener('mousedown', function(e) {
        e.stopPropagation();
    });

    btn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('[SESSIONS] toggle panel');
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

    document.addEventListener('pointerdown', function(e) {
        if (!panelEl.classList.contains('hidden')) {
            if (!panelEl.contains(e.target) && !e.target.closest('#btn-sessions')) {
                panelEl.classList.add('hidden');
            }
        }
    });

    refresh();
}

export { init, refresh };