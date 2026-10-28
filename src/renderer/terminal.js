export function createTerminal(theme) {
    if (typeof Terminal === 'undefined') {
        document.getElementById('terminal').textContent =
            'ERROR: xterm.js not loaded. Check node_modules/@xterm/xterm/lib/xterm.js';
        throw new Error('xterm.js not loaded');
    }
    if (typeof FitAddon === 'undefined') {
        document.getElementById('terminal').textContent =
            'ERROR: addon-fit not loaded. Check node_modules/@xterm/addon-fit/lib/addon-fit.js';
        throw new Error('addon-fit not loaded');
    }

    const term = new Terminal({
        fontSize: 15,
        cursorStyle: 'bar',
        cursorBlink: true,
        scrollback: 9001,
        allowTransparency: true,
        allowProposedApi: true,
        theme
    });

    const fit = new FitAddon.FitAddon();
    term.loadAddon(fit);
    term.open(document.getElementById('terminal'));

    window.__term = term;

    function doFit() {
        try {
            fit.fit();
            window.api.resize(term.cols, term.rows);
        } catch {}
    }
    new ResizeObserver(doFit).observe(document.getElementById('terminal'));

    let wheelAcc = 0;
    const WHEEL_STEP = 120;
    const WHEEL_LINES = 0.5;
    document.getElementById('terminal').addEventListener('wheel', (e) => {
        if (e.deltaY === 0) return;
        e.preventDefault();
        wheelAcc += e.deltaY;
        const lines = Math.trunc((wheelAcc / WHEEL_STEP) * WHEEL_LINES);
        if (lines !== 0) {
            wheelAcc -= (lines / WHEEL_LINES) * WHEEL_STEP;
            term.scrollLines(lines);
        }
    }, { passive: false });

    return { term, doFit };
}

export function bindInput(term) {
    let lineMode = false;
    let lineBuf = '';
    let prevCh = '';

    function lineInput(d) {
        if (d[0] === '\x1b') return;
        for (const ch of d) {
            if (ch === '\r' || (ch === '\n' && prevCh !== '\r')) {
                term.write('\r\n');
                window.api.input(lineBuf + '\r\n');
                lineBuf = '';
            } else if (ch === '\x7f' || ch === '\b') {
                if (lineBuf) { lineBuf = lineBuf.slice(0, -1); term.write('\b \b'); }
            } else if (ch === '\x03') {
                term.write('^C\r\n');
                lineBuf = '';
                window.api.input('\r\n');
            } else if (ch >= ' ') {
                lineBuf += ch;
                term.write(ch);
            }
            prevCh = ch;
        }
    }

    term.onData((d) => (lineMode ? lineInput(d) : window.api.input(d)));
    window.api.onData((d) => term.write(d));
    window.api.onMode((m) => { lineMode = m === 'line'; });
}