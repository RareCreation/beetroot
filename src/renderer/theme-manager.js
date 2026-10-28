import { THEMES } from './themes.js';

const KEY = 'bt_theme';

function getId() {
    try { return localStorage.getItem(KEY) || 'beetroot'; } catch { return 'beetroot'; }
}

function applyTheme(id, term) {
    const t = THEMES[id];
    if (!t) return;
    for (const [k, v] of Object.entries(t.css)) {
        document.documentElement.style.setProperty(k, v);
    }
    if (term) {
        try { Object.assign(term.options.theme, t.term); } catch {}
    }
    document.querySelectorAll('.theme-item').forEach((el) => {
        el.classList.toggle('active', el.dataset.id === id);
    });
    try { localStorage.setItem(KEY, id); } catch {}
}

function buildThemeList(term) {
    const list = document.getElementById('theme-list');
    list.innerHTML = '';
    for (const [id, t] of Object.entries(THEMES)) {
        const el = document.createElement('div');
        el.className = 'theme-item';
        el.dataset.id = id;
        el.innerHTML = `<span class="theme-swatch" style="background:${t.swatch}"></span><span class="theme-name">${t.name}</span>`;
        el.onclick = () => applyTheme(id, term);
        list.appendChild(el);
    }
}

export { getId, applyTheme, buildThemeList };