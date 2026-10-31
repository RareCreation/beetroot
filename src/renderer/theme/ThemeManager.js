import { THEMES } from './ThemeDefinitions.js';
import { derivePalette } from './PaletteDeriver.js';
import { buildTerminalTheme } from './TerminalThemeBuilder.js';
import { applyPaletteToCss, applyCssVariableMap } from './CssVariableApplicator.js';

const THEME_STORAGE_KEY = 'bt_theme';
const CUSTOM_STORAGE_KEY = 'bt_custom_theme';

let onThemeChangeCallback = null;

function getId() {
    try {
        return localStorage.getItem(THEME_STORAGE_KEY) || 'beetroot';
    } catch (_) {
        return 'beetroot';
    }
}

function loadCustom() {
    try {
        const raw = JSON.parse(localStorage.getItem(CUSTOM_STORAGE_KEY) || '{}');
        return raw && typeof raw === 'object' ? raw : {};
    } catch (_) {
        return {};
    }
}

function saveCustom(custom) {
    try {
        localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(custom));
    } catch (_) {}
}

function setOnThemeChange(callback) {
    onThemeChangeCallback = callback;
}

function getActiveTermTheme() {
    const id = getId();

    if (id === 'custom') {
        const custom = loadCustom();
        if (custom.base) {
            const theme = buildTerminalTheme(custom.base);
            if (theme) return theme;
        }
        return THEMES.beetroot.term;
    }

    return THEMES[id] ? THEMES[id].term : THEMES.beetroot.term;
}

function syncBaseInput(base) {
    const input = document.getElementById('cp-base');
    if (!input || !base) return;
    if (base.startsWith('#')) input.value = base;
}

function togglePalette(visible) {
    const container = document.getElementById('custom-palette');
    if (!container) return;
    container.classList.toggle('hidden', !visible);
}

function notifyThemeChange(termTheme) {
    if (typeof onThemeChangeCallback === 'function') {
        onThemeChangeCallback(termTheme);
    }
}

function applyTheme(id) {
    if (id === 'custom') {
        const custom = loadCustom();
        const base = custom.base || '#c23a44';
        syncBaseInput(base);
        applyPaletteToCss(derivePalette(base));
        togglePalette(true);
        notifyThemeChange(getActiveTermTheme());
        document.querySelectorAll('.theme-item').forEach((el) => {
            el.classList.toggle('active', el.dataset.id === 'custom');
        });
        try { localStorage.setItem(THEME_STORAGE_KEY, id); } catch (_) {}
        return;
    }

    const theme = THEMES[id];
    if (!theme) return;

    togglePalette(false);
    applyCssVariableMap(theme.css);
    notifyThemeChange(theme.term);
    document.querySelectorAll('.theme-item').forEach((el) => {
        el.classList.toggle('active', el.dataset.id === id);
    });
    try { localStorage.setItem(THEME_STORAGE_KEY, id); } catch (_) {}
}

function bindPaletteInput() {
    const input = document.getElementById('cp-base');
    if (!input) return;

    input.addEventListener('input', () => {
        const base = input.value;
        saveCustom({ base });
        applyPaletteToCss(derivePalette(base));
        notifyThemeChange(buildTerminalTheme(base) || getActiveTermTheme());
    });
}

export {
    getId,
    loadCustom,
    saveCustom,
    setOnThemeChange,
    getActiveTermTheme,
    applyTheme,
    togglePalette,
    syncBaseInput,
    bindPaletteInput,
    derivePalette,
    buildTerminalTheme,
    THEMES
};