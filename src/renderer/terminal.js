export function createTerminalInstance(theme) {
    if (typeof Terminal === 'undefined') throw new Error('xterm.js not loaded');
    if (typeof FitAddon === 'undefined') throw new Error('addon-fit not loaded');
    if (typeof SearchAddon === 'undefined') throw new Error('addon-search not loaded');

    const container = document.createElement('div');
    container.className = 'terminal-instance';
    document.getElementById('terminals-container').appendChild(container);

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

    const searchAddon = new SearchAddon.SearchAddon();
    term.loadAddon(searchAddon);

    term.open(container);

    let wheelAcc = 0;
    const WHEEL_STEP = 120;
    const WHEEL_LINES = 0.5;
    container.addEventListener('wheel', (e) => {
        if (e.deltaY === 0) return;
        e.preventDefault();
        wheelAcc += e.deltaY;
        const lines = Math.trunc((wheelAcc / WHEEL_STEP) * WHEEL_LINES);
        if (lines !== 0) {
            wheelAcc -= (lines / WHEEL_LINES) * WHEEL_STEP;
            term.scrollLines(lines);
        }
    }, { passive: false });

    function doFit() {
        try {
            fit.fit();
            window.api.resize(term.cols, term.rows);
        } catch {}
    }

    const observer = new ResizeObserver(() => {
        if (container.classList.contains('active')) doFit();
    });
    observer.observe(container);

    return { term, doFit, container, observer, searchAddon };
}

export function bindInput(term, ptyId) {
    let lineMode = false;
    let lineBuf = '';
    let prevCh = '';

    function lineInput(d) {
        if (d[0] === '\x1b') return;
        for (const ch of d) {
            if (ch === '\r' || (ch === '\n' && prevCh !== '\r')) {
                term.write('\r\n');
                window.api.input(ptyId, lineBuf + '\r\n');
                lineBuf = '';
            } else if (ch === '\x7f' || ch === '\b') {
                if (lineBuf) { lineBuf = lineBuf.slice(0, -1); term.write('\b \b'); }
            } else if (ch === '\x03') {
                term.write('^C\r\n');
                lineBuf = '';
                window.api.input(ptyId, '\r\n');
            } else if (ch >= ' ') {
                lineBuf += ch;
                term.write(ch);
            }
            prevCh = ch;
        }
    }

    term.onData((d) => (lineMode ? lineInput(d) : window.api.input(ptyId, d)));
    window.api.onData((id, d) => {
        if (id === ptyId) term.write(d);
    });
    window.api.onMode((id, m) => {
        if (id === ptyId) lineMode = m === 'line';
    });
}