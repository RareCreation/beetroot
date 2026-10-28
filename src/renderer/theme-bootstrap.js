(function () {
    var T = {
        beetroot: { win: 'rgba(24, 8, 14, .97)', frame: 'rgba(28, 10, 18, .95)', line: 'rgba(255, 120, 130, .08)', title: '#ff8c90', scroll: '#c23a44', t1: 'rgba(60, 10, 20, .65)', t2: 'rgba(10, 3, 6, .55)', t3: 'rgba(12, 4, 8, .55)', t4: 'rgba(16, 5, 10, .55)' },
        matrix:  { win: 'rgba(8, 20, 11, .97)',  frame: 'rgba(10, 26, 13, .95)',  line: 'rgba(120, 255, 140, .08)', title: '#6bff7a', scroll: '#3fbf55', t1: 'rgba(10, 40, 16, .55)', t2: 'rgba(2, 8, 3, .55)', t3: 'rgba(3, 10, 4, .55)', t4: 'rgba(5, 14, 6, .55)' },
        ocean:   { win: 'rgba(10, 30, 44, .97)', frame: 'rgba(12, 36, 52, .95)', line: 'rgba(140, 210, 255, .08)', title: '#7fdcff', scroll: '#3f8fc0', t1: 'rgba(14, 60, 90, .55)', t2: 'rgba(3, 10, 16, .55)', t3: 'rgba(4, 13, 20, .55)', t4: 'rgba(6, 18, 27, .55)' },
        amethyst:{ win: 'rgba(30, 14, 48, .97)', frame: 'rgba(38, 18, 60, .95)', line: 'rgba(200, 160, 255, .08)', title: '#d8a8ff', scroll: '#7a3fb0', t1: 'rgba(60, 20, 90, .55)', t2: 'rgba(8, 4, 14, .55)', t3: 'rgba(10, 5, 18, .55)', t4: 'rgba(14, 7, 24, .55)' },
        mono:    { win: 'rgba(26, 26, 26, .97)', frame: 'rgba(32, 32, 32, .95)', line: 'rgba(255, 255, 255, .07)', title: '#c0c0c0', scroll: '#606060', t1: 'rgba(40, 40, 40, .55)', t2: 'rgba(6, 6, 6, .55)', t3: 'rgba(9, 9, 9, .55)', t4: 'rgba(12, 12, 12, .55)' }
    };
    var id = 'beetroot';
    try { id = localStorage.getItem('bt_theme') || 'beetroot'; } catch (e) {}
    var t = T[id] || T.beetroot;
    var s = document.documentElement.style;
    s.setProperty('--win-bg', t.win);
    s.setProperty('--frame-bg', t.frame);
    s.setProperty('--frame-line', t.line);
    s.setProperty('--title', t.title);
    s.setProperty('--scroll', t.scroll);
    s.setProperty('--term-bg-1', t.t1);
    s.setProperty('--term-bg-2', t.t2);
    s.setProperty('--term-bg-3', t.t3);
    s.setProperty('--term-bg-4', t.t4);
})();