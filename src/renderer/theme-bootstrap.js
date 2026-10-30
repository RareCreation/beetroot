(function () {
    var T = {
        beetroot: { win: 'rgba(24, 8, 14, .97)', frame: 'rgba(28, 10, 18, .95)', line: 'rgba(255, 120, 130, .08)', title: '#ff8c90', scroll: '#c23a44', t1: 'rgba(60, 10, 20, .65)', t2: 'rgba(10, 3, 6, .55)', t3: 'rgba(12, 4, 8, .55)', t4: 'rgba(16, 5, 10, .55)' },
        matrix:  { win: 'rgba(8, 20, 11, .97)',  frame: 'rgba(10, 26, 13, .95)',  line: 'rgba(120, 255, 140, .08)', title: '#6bff7a', scroll: '#3fbf55', t1: 'rgba(10, 40, 16, .55)', t2: 'rgba(2, 8, 3, .55)', t3: 'rgba(3, 10, 4, .55)', t4: 'rgba(5, 14, 6, .55)' },
        ocean:   { win: 'rgba(10, 30, 44, .97)', frame: 'rgba(12, 36, 52, .95)', line: 'rgba(140, 210, 255, .08)', title: '#7fdcff', scroll: '#3f8fc0', t1: 'rgba(14, 60, 90, .55)', t2: 'rgba(3, 10, 16, .55)', t3: 'rgba(4, 13, 20, .55)', t4: 'rgba(6, 18, 27, .55)' },
        amethyst:{ win: 'rgba(30, 14, 48, .97)', frame: 'rgba(38, 18, 60, .95)', line: 'rgba(200, 160, 255, .08)', title: '#d8a8ff', scroll: '#7a3fb0', t1: 'rgba(60, 20, 90, .55)', t2: 'rgba(8, 4, 14, .55)', t3: 'rgba(10, 5, 18, .55)', t4: 'rgba(14, 7, 24, .55)' },
        mono:    { win: 'rgba(26, 26, 26, .97)', frame: 'rgba(32, 32, 32, .95)', line: 'rgba(255, 255, 255, .07)', title: '#c0c0c0', scroll: '#606060', t1: 'rgba(40, 40, 40, .55)', t2: 'rgba(6, 6, 6, .55)', t3: 'rgba(9, 9, 9, .55)', t4: 'rgba(12, 12, 12, .55)' }
    };

    function hexToHsl(hex) {
        var h = String(hex || '').replace('#', '');
        if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
        var n = parseInt(h, 16);
        if (Number.isNaN(n)) return [0, 0, 50];
        var r = ((n >> 16) & 255) / 255;
        var g = ((n >> 8) & 255) / 255;
        var b = (n & 255) / 255;
        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);
        var hh = 0;
        var ss = 0;
        var l = (max + min) / 2;
        if (max !== min) {
            var d = max - min;
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
        return a === undefined ? 'hsl(' + h + ', ' + s + '%, ' + l + '%)' : 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + a + ')';
    }

    function derivePalette(baseHex) {
        if (!baseHex) return null;
        var hslv = hexToHsl(baseHex);
        var h = hslv[0];
        var s = hslv[1];
        var l = hslv[2];

        var isAchromatic = s < 8;
        var chroma = isAchromatic ? 0 : Math.max(18, Math.min(60, s * 0.7));

        var winL = Math.max(4, Math.min(14, l * 0.22));
        var frameL = Math.max(6, Math.min(18, l * 0.30));
        var titleL = Math.max(58, Math.min(78, l + 28));
        var scrollL = Math.max(34, Math.min(52, l + 6));
        var t1L = Math.max(10, Math.min(26, l * 0.42));

        var hueShift = 8;
        var hWin = (h + hueShift) % 360;
        var hFrame = (h - hueShift + 360) % 360;
        var hTitle = (h + hueShift / 2) % 360;
        var hScroll = (h - hueShift / 2 + 360) % 360;

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

    window.__derivePalette = derivePalette;

    var id = 'beetroot';
    try { id = localStorage.getItem('bt_theme') || 'beetroot'; } catch (e) {}
    var s = document.documentElement.style;

    try {
        if (id === 'custom') {
            var c = {};
            try { c = JSON.parse(localStorage.getItem('bt_custom_theme') || '{}'); } catch (e) { c = {}; }
            var p = c.base ? derivePalette(c.base) : null;
            if (p) {
                s.setProperty('--win-bg', p.win);
                s.setProperty('--frame-bg', p.frame);
                s.setProperty('--frame-line', p.line);
                s.setProperty('--title', p.title);
                s.setProperty('--scroll', p.scroll);
                s.setProperty('--term-bg-1', p.t1);
                s.setProperty('--term-bg-2', p.t2);
                s.setProperty('--term-bg-3', p.t3);
                s.setProperty('--term-bg-4', p.t4);
                return;
            }
            id = 'beetroot';
        }

        var t = T[id] || T.beetroot;
        s.setProperty('--win-bg', t.win);
        s.setProperty('--frame-bg', t.frame);
        s.setProperty('--frame-line', t.line);
        s.setProperty('--title', t.title);
        s.setProperty('--scroll', t.scroll);
        s.setProperty('--term-bg-1', t.t1);
        s.setProperty('--term-bg-2', t.t2);
        s.setProperty('--term-bg-3', t.t3);
        s.setProperty('--term-bg-4', t.t4);
    } catch (e) {
        var f = T.beetroot;
        s.setProperty('--win-bg', f.win);
        s.setProperty('--frame-bg', f.frame);
        s.setProperty('--frame-line', f.line);
        s.setProperty('--title', f.title);
        s.setProperty('--scroll', f.scroll);
        s.setProperty('--term-bg-1', f.t1);
        s.setProperty('--term-bg-2', f.t2);
        s.setProperty('--term-bg-3', f.t3);
        s.setProperty('--term-bg-4', f.t4);
    }
})();