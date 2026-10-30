import { THEMES } from './themes.js';

const KEY = 'bt_theme';
const CUSTOM_KEY = 'bt_custom_theme';

function hexToHsl(hex) {
    let h = String(hex || '').replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h, 16);
    if (Number.isNaN(n)) return [0, 0, 50];
    const r = ((n >> 16) & 255) / 255;
    const g = ((n >> 8) & 255) / 255;
    const b = (n & 255) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let hh = 0;
    let ss = 0;
    const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        ss = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: hh = (g - b) / d + (g < b ? 6 : 0); break;
            case g: hh = (b - r) / d + 2; break;
            case b: hh = (r - g) / d + 4; break;
        }
        hh /= 6;
    }
    return [hh * 360, ss * 100, l * 100];
}

function hsl(h, s, l, a) {
    return a === undefined ? `hsl(${h}, ${s}%, ${l}%)` : `hsla(${h}, ${s}%, ${l}%, ${a})`;
}

function derivePalette(baseHex) {
    if (!baseHex) return null;
    const [h, s, l] = hexToHsl(baseHex);
    const isAchromatic = s < 8;
    const chroma = isAchromatic ? 0 : Math.max(18, Math.min(60, s * 0.7));
    const winL = Math.max(4, Math.min(14, l * 0.22));
    const frameL = Math.max(6, Math.min(18, l * 0.30));
    const titleL = Math.max(58, Math.min(78, l + 28));
    const scrollL = Math.max(34, Math.min(52, l + 6));
    const t1L = Math.max(10, Math.min(26, l * 0.42));
    const hueShift = 8;
    const hWin = (h + hueShift) % 360;
    const hFrame = (h - hueShift + 360) % 360;
    const hTitle = (h + hueShift / 2) % 360;
    const hScroll = (h - hueShift / 2 + 360) % 360;
    return {
        win: hsl(hWin, chroma * 0.55, winL, 0.97),
        frame: hsl(hFrame, chroma * 0.65, frameL, 0.95),
        line: hsl(hTitle, chroma, titleL, 0.08),
        title: hsl(hTitle, chroma, titleL),
        scroll: hsl(hScroll, chroma, scrollL),
        t1: hsl(hWin, chroma * 0.75, t1L, 0.65),
        t2: hsl(hFrame, chroma * 0.45, 3, 0.55),
        t3: hsl(hWin, chroma * 0.45, 5, 0.55),
        t4: hsl(hFrame, chroma * 0.45, 8, 0.55)
    };
}

function buildTermTheme(baseHex) {
    const p = derivePalette(baseHex);
    if (!p) return null;
    const [h, s] = hexToHsl(baseHex);
    const isAchromatic = s < 8;
    const sat = isAchromatic ? 0 : Math.max(30, Math.min(70, s));
    return {
        background: 'rgba(0,0,0,0)',
        foreground: hsl(h, Math.min(12, sat), 92),
        cursor: p.title,
        cursorAccent: '#000000',
        selectionBackground: hsl(h, sat, 60, 0.35),
        black: hsl(h, sat * 0.5, 8),
        brightBlack: hsl(h, sat * 0.5, 38),
        red: hsl(h, sat, 62),
        brightRed: hsl(h, sat, 74),
        green: hsl((h + 120) % 360, sat, 58),
        brightGreen: hsl((h + 120) % 360, sat, 72),
        yellow: hsl((h + 50) % 360, sat, 62),
        brightYellow: hsl((h + 50) % 360, sat, 76),
        blue: hsl((h + 210) % 360, sat, 65),
        brightBlue: hsl((h + 210) % 360, sat, 76),
        magenta: hsl((h + 285) % 360, sat, 65),
        brightMagenta: hsl((h + 285) % 360, sat, 76),
        cyan: hsl((h + 170) % 360, sat, 62),
        brightCyan: hsl((h + 170) % 360, sat, 74),
        white: hsl(h, Math.min(10, sat), 82),
        brightWhite: '#ffffff'
    };
}

window.__derivePalette = derivePalette;

function getId() {
    try { return localStorage.getItem(KEY) || 'beetroot'; } catch { return 'beetroot'; }
}

function loadCustom() {
    try {
        const raw = JSON.parse(localStorage.getItem(CUSTOM_KEY) || '{}');
        return raw && typeof raw === 'object' ? raw : {};
    } catch { return {}; }
}

function saveCustom(c) {
    try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(c)); } catch {}
}

function getActiveTermTheme() {
    const id = getId();
    if (id === 'custom') {
        const c = loadCustom();
        if (c.base) {
            const t = buildTermTheme(c.base);
            if (t) return t;
        }
        return THEMES.beetroot.term;
    }
    return THEMES[id] ? THEMES[id].term : THEMES.beetroot.term;
}

function applyPaletteToCss(p) {
    const s = document.documentElement.style;
    if (!p) return;
    s.setProperty('--win-bg', p.win);
    s.setProperty('--frame-bg', p.frame);
    s.setProperty('--frame-line', p.line);
    s.setProperty('--title', p.title);
    s.setProperty('--scroll', p.scroll);
    s.setProperty('--term-bg-1', p.t1);
    s.setProperty('--term-bg-2', p.t2);
    s.setProperty('--term-bg-3', p.t3);
    s.setProperty('--term-bg-4', p.t4);
}

function togglePalette(show) {
    const el = document.getElementById('custom-palette');
    if (!el) return;
    el.classList.toggle('hidden', !show);
}

function syncBaseInput(base) {
    const el = document.getElementById('cp-base');
    if (!el || !base) return;
    if (base.startsWith('#')) el.value = base;
}

function applyTheme(id, term, onThemeChange) {
    if (id === 'custom') {
        const c = loadCustom();
        const base = c.base || '#c23a44';
        syncBaseInput(base);
        applyPaletteToCss(derivePalette(base));
        togglePalette(true);
        const newTermTheme = getActiveTermTheme();
        if (onThemeChange) onThemeChange(newTermTheme);
        document.querySelectorAll('.theme-item').forEach((el) => {
            el.classList.toggle('active', el.dataset.id === 'custom');
        });
        try { localStorage.setItem(KEY, id); } catch {}
        return;
    }
    const t = THEMES[id];
    if (!t) return;
    togglePalette(false);
    for (const [k, v] of Object.entries(t.css)) {
        document.documentElement.style.setProperty(k, v);
    }
    if (onThemeChange) onThemeChange(t.term);
    document.querySelectorAll('.theme-item').forEach((el) => {
        el.classList.toggle('active', el.dataset.id === id);
    });
    try { localStorage.setItem(KEY, id); } catch {}
}

function bindPalette(onThemeChange) {
    const input = document.getElementById('cp-base');
    if (!input) return;
    input.addEventListener('input', () => {
        const base = input.value;
        saveCustom({ base });
        applyPaletteToCss(derivePalette(base));
        if (onThemeChange) {
            const t = buildTermTheme(base);
            if (t) onThemeChange(t);
        }
    });
}

function buildThemeList(onThemeChange) {
    const list = document.getElementById('theme-list');
    list.innerHTML = '';
    for (const [id, t] of Object.entries(THEMES)) {
        const el = document.createElement('div');
        el.className = 'theme-item';
        el.dataset.id = id;
        el.innerHTML = `<span class="theme-swatch" style="background:${t.swatch}"></span><span class="theme-name">${t.name}</span>`;
        el.onclick = () => applyTheme(id, null, onThemeChange);
        list.appendChild(el);
    }
    const customEl = document.createElement('div');
    customEl.className = 'theme-item';
    customEl.dataset.id = 'custom';
    customEl.innerHTML = `<span class="theme-swatch" style="background:conic-gradient(#ff6b70, #f5d76e, #6bd10a, #7fdcff, #d8a8ff, #ff6b70)"></span><span class="theme-name">Custom</span>`;
    customEl.onclick = () => applyTheme('custom', null, onThemeChange);
    list.appendChild(customEl);
    bindPalette(onThemeChange);

    const activeId = getId();
    if (activeId === 'custom') {
        const c = loadCustom();
        syncBaseInput(c.base || '#c23a44');
        togglePalette(true);
    }
    document.querySelectorAll('.theme-item').forEach((el) => {
        el.classList.toggle('active', el.dataset.id === activeId);
    });
}

export { getId, applyTheme, buildThemeList, loadCustom, derivePalette, buildTermTheme, getActiveTermTheme, togglePalette };