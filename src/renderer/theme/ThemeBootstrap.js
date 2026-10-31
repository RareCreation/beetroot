(function bootstrapTheme() {
    const THEMES = {
        beetroot: { win: 'rgba(24, 8, 14, .97)', frame: 'rgba(28, 10, 18, .95)', line: 'rgba(255, 120, 130, .08)', title: '#ff8c90', scroll: '#c23a44', t1: 'rgba(60, 10, 20, .65)', t2: 'rgba(10, 3, 6, .55)', t3: 'rgba(12, 4, 8, .55)', t4: 'rgba(16, 5, 10, .55)' },
        mango: { win: 'rgba(34, 18, 6, .97)', frame: 'rgba(42, 22, 8, .95)', line: 'rgba(255, 179, 71, .08)', title: '#ffb347', scroll: '#c47a1e', t1: 'rgba(80, 40, 10, .65)', t2: 'rgba(14, 7, 2, .55)', t3: 'rgba(18, 9, 3, .55)', t4: 'rgba(22, 11, 4, .55)' },
        cherry: { win: 'rgba(28, 6, 12, .97)', frame: 'rgba(36, 8, 16, .95)', line: 'rgba(255, 77, 109, .08)', title: '#ff4d6d', scroll: '#c42a4a', t1: 'rgba(70, 10, 22, .65)', t2: 'rgba(10, 2, 4, .55)', t3: 'rgba(14, 3, 6, .55)', t4: 'rgba(18, 4, 8, .55)' },
        lime: { win: 'rgba(18, 30, 6, .97)', frame: 'rgba(22, 38, 8, .95)', line: 'rgba(182, 255, 58, .08)', title: '#b6ff3a', scroll: '#7ac41e', t1: 'rgba(40, 70, 10, .65)', t2: 'rgba(6, 10, 2, .55)', t3: 'rgba(8, 14, 3, .55)', t4: 'rgba(10, 18, 4, .55)' },
        blueberry: { win: 'rgba(8, 14, 38, .97)', frame: 'rgba(10, 18, 46, .95)', line: 'rgba(106, 140, 255, .08)', title: '#6a8cff', scroll: '#3a5cc4', t1: 'rgba(14, 30, 80, .65)', t2: 'rgba(3, 6, 14, .55)', t3: 'rgba(4, 8, 18, .55)', t4: 'rgba(5, 10, 22, .55)' },
        grape: { win: 'rgba(20, 8, 30, .97)', frame: 'rgba(26, 10, 38, .95)', line: 'rgba(176, 106, 255, .08)', title: '#b06aff', scroll: '#7a3ac4', t1: 'rgba(40, 14, 70, .65)', t2: 'rgba(6, 2, 10, .55)', t3: 'rgba(8, 3, 14, .55)', t4: 'rgba(10, 4, 18, .55)' },
        peach: { win: 'rgba(34, 16, 12, .97)', frame: 'rgba(42, 20, 14, .95)', line: 'rgba(255, 181, 158, .08)', title: '#ffb59e', scroll: '#c47a5a', t1: 'rgba(80, 34, 22, .65)', t2: 'rgba(14, 6, 4, .55)', t3: 'rgba(18, 8, 5, .55)', t4: 'rgba(22, 10, 6, .55)' },
        mint: { win: 'rgba(6, 26, 20, .97)', frame: 'rgba(8, 34, 26, .95)', line: 'rgba(106, 255, 192, .08)', title: '#6affc0', scroll: '#1ec48a', t1: 'rgba(10, 70, 50, .65)', t2: 'rgba(2, 8, 6, .55)', t3: 'rgba(3, 10, 8, .55)', t4: 'rgba(4, 14, 10, .55)' },
        lemon: { win: 'rgba(34, 30, 8, .97)', frame: 'rgba(42, 36, 10, .95)', line: 'rgba(255, 230, 106, .08)', title: '#ffe66a', scroll: '#c4a81e', t1: 'rgba(80, 70, 16, .65)', t2: 'rgba(14, 12, 2, .55)', t3: 'rgba(18, 15, 3, .55)', t4: 'rgba(22, 18, 4, .55)' },
        sakura: { win: 'rgba(34, 16, 22, .97)', frame: 'rgba(42, 20, 28, .95)', line: 'rgba(255, 179, 198, .08)', title: '#ffb3c6', scroll: '#c47a8f', t1: 'rgba(80, 34, 44, .65)', t2: 'rgba(14, 6, 8, .55)', t3: 'rgba(18, 8, 10, .55)', t4: 'rgba(22, 10, 12, .55)' },
        lavender: { win: 'rgba(20, 16, 34, .97)', frame: 'rgba(26, 20, 42, .95)', line: 'rgba(200, 179, 255, .08)', title: '#c8b3ff', scroll: '#8a6ac4', t1: 'rgba(44, 34, 80, .65)', t2: 'rgba(6, 4, 14, .55)', t3: 'rgba(8, 5, 18, .55)', t4: 'rgba(10, 6, 22, .55)' },
        sky: { win: 'rgba(8, 24, 38, .97)', frame: 'rgba(10, 32, 48, .95)', line: 'rgba(158, 220, 255, .08)', title: '#9edcff', scroll: '#4a9ac4', t1: 'rgba(14, 50, 80, .65)', t2: 'rgba(3, 8, 14, .55)', t3: 'rgba(4, 11, 18, .55)', t4: 'rgba(5, 14, 22, .55)' },
        sand: { win: 'rgba(34, 30, 22, .97)', frame: 'rgba(42, 36, 26, .95)', line: 'rgba(230, 211, 163, .08)', title: '#e6d3a3', scroll: '#a8986a', t1: 'rgba(80, 70, 50, .65)', t2: 'rgba(14, 12, 8, .55)', t3: 'rgba(18, 15, 10, .55)', t4: 'rgba(22, 18, 12, .55)' },
        cyberpunk: { win: 'rgba(8, 8, 34, .97)', frame: 'rgba(10, 10, 42, .95)', line: 'rgba(255, 43, 214, .1)', title: '#ff2bd6', scroll: '#c41ea0', t1: 'rgba(30, 10, 80, .65)', t2: 'rgba(3, 3, 14, .55)', t3: 'rgba(4, 4, 18, .55)', t4: 'rgba(5, 5, 22, .55)' },
        synthwave: { win: 'rgba(20, 8, 30, .97)', frame: 'rgba(26, 10, 38, .95)', line: 'rgba(255, 106, 193, .1)', title: '#ff6ac1', scroll: '#c44a9a', t1: 'rgba(50, 14, 70, .65)', t2: 'rgba(8, 2, 10, .55)', t3: 'rgba(10, 3, 14, .55)', t4: 'rgba(12, 4, 18, .55)' },
        toxic: { win: 'rgba(8, 26, 6, .97)', frame: 'rgba(10, 34, 8, .95)', line: 'rgba(170, 255, 43, .1)', title: '#aaff2b', scroll: '#7ac41e', t1: 'rgba(20, 70, 10, .65)', t2: 'rgba(2, 8, 2, .55)', t3: 'rgba(3, 10, 3, .55)', t4: 'rgba(4, 14, 4, .55)' },
        inferno: { win: 'rgba(28, 6, 6, .97)', frame: 'rgba(36, 8, 8, .95)', line: 'rgba(255, 58, 43, .1)', title: '#ff3a2b', scroll: '#c42a1e', t1: 'rgba(70, 10, 10, .65)', t2: 'rgba(10, 2, 2, .55)', t3: 'rgba(14, 3, 3, .55)', t4: 'rgba(18, 4, 4, .55)' },
        arctic: { win: 'rgba(6, 24, 34, .97)', frame: 'rgba(8, 32, 44, .95)', line: 'rgba(168, 240, 255, .1)', title: '#a8f0ff', scroll: '#4aa8c4', t1: 'rgba(10, 50, 70, .65)', t2: 'rgba(2, 8, 12, .55)', t3: 'rgba(3, 10, 15, .55)', t4: 'rgba(4, 14, 20, .55)' },
        obsidian: { win: 'rgba(12, 12, 12, .97)', frame: 'rgba(16, 16, 16, .95)', line: 'rgba(255, 255, 255, .06)', title: '#9a9a9a', scroll: '#4a4a4a', t1: 'rgba(30, 30, 30, .65)', t2: 'rgba(4, 4, 4, .55)', t3: 'rgba(6, 6, 6, .55)', t4: 'rgba(8, 8, 8, .55)' },
        graphite: { win: 'rgba(22, 22, 22, .97)', frame: 'rgba(28, 28, 28, .95)', line: 'rgba(255, 255, 255, .07)', title: '#b0b0b0', scroll: '#5a5a5a', t1: 'rgba(40, 40, 40, .65)', t2: 'rgba(6, 6, 6, .55)', t3: 'rgba(8, 8, 8, .55)', t4: 'rgba(10, 10, 10, .55)' },
        slate: { win: 'rgba(18, 22, 28, .97)', frame: 'rgba(22, 28, 36, .95)', line: 'rgba(143, 163, 184, .08)', title: '#8fa3b8', scroll: '#4a5a6a', t1: 'rgba(30, 40, 50, .65)', t2: 'rgba(5, 6, 8, .55)', t3: 'rgba(7, 9, 12, .55)', t4: 'rgba(9, 12, 16, .55)' },
        midnight: { win: 'rgba(6, 8, 18, .97)', frame: 'rgba(8, 10, 24, .95)', line: 'rgba(122, 140, 255, .08)', title: '#7a8cff', scroll: '#4a5ac4', t1: 'rgba(16, 20, 50, .65)', t2: 'rgba(2, 3, 6, .55)', t3: 'rgba(3, 4, 9, .55)', t4: 'rgba(4, 6, 12, .55)' },
        forest: { win: 'rgba(8, 24, 14, .97)', frame: 'rgba(10, 32, 18, .95)', line: 'rgba(106, 191, 138, .08)', title: '#6abf8a', scroll: '#3a8a5a', t1: 'rgba(16, 50, 28, .65)', t2: 'rgba(2, 8, 4, .55)', t3: 'rgba(3, 10, 6, .55)', t4: 'rgba(4, 14, 8, .55)' },
        'duotone-ember': { win: 'rgba(26, 10, 8, .97)', frame: 'rgba(34, 14, 10, .95)', line: 'rgba(255, 140, 66, .1)', title: '#ff8c42', scroll: '#c46a2a', t1: 'rgba(60, 20, 10, .65)', t2: 'rgba(8, 3, 2, .55)', t3: 'rgba(10, 4, 3, .55)', t4: 'rgba(14, 5, 4, .55)' },
        'duotone-ice': { win: 'rgba(8, 16, 24, .97)', frame: 'rgba(10, 20, 30, .95)', line: 'rgba(127, 216, 255, .1)', title: '#7fd8ff', scroll: '#3a9ac4', t1: 'rgba(10, 30, 50, .65)', t2: 'rgba(2, 4, 6, .55)', t3: 'rgba(3, 6, 9, .55)', t4: 'rgba(4, 8, 12, .55)' },
        'duotone-moss': { win: 'rgba(10, 20, 8, .97)', frame: 'rgba(12, 26, 10, .95)', line: 'rgba(163, 230, 53, .1)', title: '#a3e635', scroll: '#6aa81e', t1: 'rgba(20, 50, 10, .65)', t2: 'rgba(2, 4, 2, .55)', t3: 'rgba(3, 6, 3, .55)', t4: 'rgba(4, 8, 4, .55)' },
        'duotone-rose': { win: 'rgba(26, 8, 16, .97)', frame: 'rgba(34, 10, 20, .95)', line: 'rgba(255, 122, 138, .1)', title: '#ff7a8a', scroll: '#c43a4a', t1: 'rgba(60, 14, 26, .65)', t2: 'rgba(8, 2, 4, .55)', t3: 'rgba(10, 3, 6, .55)', t4: 'rgba(14, 4, 8, .55)' },
        'duotone-violet': { win: 'rgba(16, 8, 24, .97)', frame: 'rgba(20, 10, 30, .95)', line: 'rgba(192, 132, 252, .1)', title: '#c084fc', scroll: '#8a4ac4', t1: 'rgba(40, 14, 60, .65)', t2: 'rgba(4, 2, 6, .55)', t3: 'rgba(6, 3, 9, .55)', t4: 'rgba(8, 4, 12, .55)' },
        'duotone-sand': { win: 'rgba(26, 20, 8, .97)', frame: 'rgba(34, 26, 10, .95)', line: 'rgba(230, 194, 106, .1)', title: '#e6c26a', scroll: '#a88a3a', t1: 'rgba(60, 44, 14, .65)', t2: 'rgba(8, 6, 2, .55)', t3: 'rgba(10, 8, 3, .55)', t4: 'rgba(14, 10, 4, .55)' },
        gruvbox: { win: 'rgba(40, 40, 40, .97)', frame: 'rgba(50, 48, 47, .95)', line: 'rgba(250, 189, 47, .08)', title: '#fabd2f', scroll: '#a8822a', t1: 'rgba(60, 56, 54, .65)', t2: 'rgba(10, 10, 10, .55)', t3: 'rgba(14, 14, 14, .55)', t4: 'rgba(18, 18, 18, .55)' },
        nord: { win: 'rgba(46, 52, 64, .97)', frame: 'rgba(59, 66, 82, .95)', line: 'rgba(136, 192, 208, .08)', title: '#88c0d0', scroll: '#5e81ac', t1: 'rgba(59, 66, 82, .65)', t2: 'rgba(12, 14, 18, .55)', t3: 'rgba(16, 18, 22, .55)', t4: 'rgba(20, 22, 28, .55)' },
        dracula: { win: 'rgba(40, 42, 54, .97)', frame: 'rgba(48, 50, 64, .95)', line: 'rgba(255, 121, 198, .08)', title: '#ff79c6', scroll: '#bd93f9', t1: 'rgba(60, 62, 80, .65)', t2: 'rgba(10, 10, 14, .55)', t3: 'rgba(14, 14, 18, .55)', t4: 'rgba(18, 18, 24, .55)' },
        'tokyo-night': { win: 'rgba(26, 27, 38, .97)', frame: 'rgba(32, 34, 48, .95)', line: 'rgba(122, 162, 247, .08)', title: '#7aa2f7', scroll: '#3a5ac4', t1: 'rgba(40, 44, 70, .65)', t2: 'rgba(6, 6, 10, .55)', t3: 'rgba(8, 9, 14, .55)', t4: 'rgba(10, 11, 18, .55)' },
        catppuccin: { win: 'rgba(30, 30, 46, .97)', frame: 'rgba(36, 36, 54, .95)', line: 'rgba(203, 166, 247, .08)', title: '#cba6f7', scroll: '#7a5ac4', t1: 'rgba(48, 48, 72, .65)', t2: 'rgba(8, 8, 12, .55)', t3: 'rgba(10, 10, 16, .55)', t4: 'rgba(12, 12, 20, .55)' },
        'one-dark': { win: 'rgba(40, 44, 52, .97)', frame: 'rgba(48, 52, 62, .95)', line: 'rgba(97, 175, 239, .08)', title: '#61afef', scroll: '#3a7ac4', t1: 'rgba(60, 66, 78, .65)', t2: 'rgba(10, 11, 14, .55)', t3: 'rgba(14, 15, 18, .55)', t4: 'rgba(18, 20, 24, .55)' }
    };

    function hexToHsl(hex) {
        let h = String(hex || '').replace('#', '');
        if (h.length === 3) h = h.split('').map((c) => c + c).join('');
        const numeric = parseInt(h, 16);
        if (Number.isNaN(numeric)) return [0, 0, 50];
        const r = ((numeric >> 16) & 255) / 255;
        const g = ((numeric >> 8) & 255) / 255;
        const b = (numeric & 255) / 255;
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
        return a === undefined
            ? `hsl(${h}, ${s}%, ${l}%)`
            : `hsla(${h}, ${s}%, ${l}%, ${a})`;
    }

    function derivePalette(baseHex) {
        if (!baseHex) return null;
        const [h, s, l] = hexToHsl(baseHex);
        const isAchromatic = s < 8;
        const chroma = isAchromatic ? 0 : Math.max(18, Math.min(60, s * 0.7));
        const winLightness = Math.max(4, Math.min(14, l * 0.22));
        const frameLightness = Math.max(6, Math.min(18, l * 0.30));
        const titleLightness = Math.max(58, Math.min(78, l + 28));
        const scrollLightness = Math.max(34, Math.min(52, l + 6));
        const termBackgroundLightness = Math.max(10, Math.min(26, l * 0.42));
        const hueShift = 8;
        const windowHue = (h + hueShift) % 360;
        const frameHue = (h - hueShift + 360) % 360;
        const titleHue = (h + hueShift / 2) % 360;
        const scrollHue = (h - hueShift / 2 + 360) % 360;
        return {
            win: hsl(windowHue, chroma * 0.55, winLightness, 0.97),
            frame: hsl(frameHue, chroma * 0.65, frameLightness, 0.95),
            line: hsl(titleHue, chroma, titleLightness, 0.08),
            title: hsl(titleHue, chroma, titleLightness),
            scroll: hsl(scrollHue, chroma, scrollLightness),
            t1: hsl(windowHue, chroma * 0.75, termBackgroundLightness, 0.65),
            t2: hsl(frameHue, chroma * 0.45, 3, 0.55),
            t3: hsl(windowHue, chroma * 0.45, 5, 0.55),
            t4: hsl(frameHue, chroma * 0.45, 8, 0.55)
        };
    }

    window.__derivePalette = derivePalette;

    const style = document.documentElement.style;

    let themeId = 'beetroot';
    try { themeId = localStorage.getItem('bt_theme') || 'beetroot'; } catch (_) {}

    try {
        if (themeId === 'custom') {
            let custom = {};
            try {
                custom = JSON.parse(localStorage.getItem('bt_custom_theme') || '{}');
            } catch (_) {
                custom = {};
            }
            const palette = custom.base ? derivePalette(custom.base) : null;
            if (palette) {
                style.setProperty('--win-bg', palette.win);
                style.setProperty('--frame-bg', palette.frame);
                style.setProperty('--frame-line', palette.line);
                style.setProperty('--title', palette.title);
                style.setProperty('--scroll', palette.scroll);
                style.setProperty('--term-bg-1', palette.t1);
                style.setProperty('--term-bg-2', palette.t2);
                style.setProperty('--term-bg-3', palette.t3);
                style.setProperty('--term-bg-4', palette.t4);
                return;
            }
            themeId = 'beetroot';
        }

        const theme = THEMES[themeId] || THEMES.beetroot;
        style.setProperty('--win-bg', theme.win);
        style.setProperty('--frame-bg', theme.frame);
        style.setProperty('--frame-line', theme.line);
        style.setProperty('--title', theme.title);
        style.setProperty('--scroll', theme.scroll);
        style.setProperty('--term-bg-1', theme.t1);
        style.setProperty('--term-bg-2', theme.t2);
        style.setProperty('--term-bg-3', theme.t3);
        style.setProperty('--term-bg-4', theme.t4);
    } catch (_) {
        const fallback = THEMES.beetroot;
        style.setProperty('--win-bg', fallback.win);
        style.setProperty('--frame-bg', fallback.frame);
        style.setProperty('--frame-line', fallback.line);
        style.setProperty('--title', fallback.title);
        style.setProperty('--scroll', fallback.scroll);
        style.setProperty('--term-bg-1', fallback.t1);
        style.setProperty('--term-bg-2', fallback.t2);
        style.setProperty('--term-bg-3', fallback.t3);
        style.setProperty('--term-bg-4', fallback.t4);
    }
})();