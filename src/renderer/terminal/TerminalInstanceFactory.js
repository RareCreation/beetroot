import { attachWheelScrollHandler } from './TerminalWheelScrollHandler.js';
import { attachResizeObserver } from './TerminalResizeObserver.js';

function createTerminalInstance(theme) {
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

    attachWheelScrollHandler(container, term);

    function doFit() {
        try {
            fit.fit();
            window.api.resize(term.cols, term.rows);
        } catch (_) {}
    }

    const observer = attachResizeObserver(container, doFit);

    return { term, doFit, container, observer, searchAddon };
}

export { createTerminalInstance };