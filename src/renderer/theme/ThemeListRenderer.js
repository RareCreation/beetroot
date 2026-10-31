import { THEMES, THEME_CATEGORIES } from './ThemeDefinitions.js';
import { getId, loadCustom, applyTheme, togglePalette, syncBaseInput, bindPaletteInput } from './ThemeManager.js';
import { CustomScrollbar } from '../core/CustomScrollbar.js';

let scrollbar = null;

function buildThemeList() {
    const list = document.getElementById('theme-list');
    if (!list) return;
    list.innerHTML = '';

    for (const category of THEME_CATEGORIES) {
        const items = Object.entries(THEMES).filter(([, t]) => t.category === category.id);
        if (items.length === 0) continue;

        const header = document.createElement('div');
        header.className = 'theme-category';
        header.textContent = category.label;
        list.appendChild(header);

        for (const [id, theme] of items) {
            const item = document.createElement('div');
            item.className = 'theme-item';
            item.dataset.id = id;
            item.innerHTML = `<span class="theme-swatch" style="background:${theme.swatch}"></span><span class="theme-name">${theme.name}</span>`;
            item.onclick = () => applyTheme(id);
            list.appendChild(item);
        }
    }

    const customHeader = document.createElement('div');
    customHeader.className = 'theme-category';
    customHeader.textContent = 'Custom';
    list.appendChild(customHeader);

    const customItem = document.createElement('div');
    customItem.className = 'theme-item';
    customItem.dataset.id = 'custom';
    customItem.innerHTML = `<span class="theme-swatch" style="background:conic-gradient(#ff6b70, #f5d76e, #6bd10a, #7fdcff, #d8a8ff, #ff6b70)"></span><span class="theme-name">Custom</span>`;
    customItem.onclick = () => applyTheme('custom');
    list.appendChild(customItem);

    bindPaletteInput();

    const activeId = getId();
    if (activeId === 'custom') {
        const custom = loadCustom();
        syncBaseInput(custom.base || '#c23a44');
        togglePalette(true);
    }

    document.querySelectorAll('.theme-item').forEach((el) => {
        el.classList.toggle('active', el.dataset.id === activeId);
    });

    if (scrollbar) scrollbar.dispose();
    scrollbar = new CustomScrollbar({ container: list, className: 'custom-scrollbar' });
    scrollbar.install();
}

export { buildThemeList };