function bindInput(term, ptyId) {
    let lineMode = false;
    let lineBuffer = '';
    let previousChar = '';

    function handleLineInput(data) {
        if (data[0] === '\x1b') return;

        for (const ch of data) {
            if (ch === '\r' || (ch === '\n' && previousChar !== '\r')) {
                term.write('\r\n');
                window.api.input(ptyId, lineBuffer + '\r\n');
                lineBuffer = '';
            } else if (ch === '\x7f' || ch === '\b') {
                if (lineBuffer) {
                    lineBuffer = lineBuffer.slice(0, -1);
                    term.write('\b \b');
                }
            } else if (ch === '\x03') {
                term.write('^C\r\n');
                lineBuffer = '';
                window.api.input(ptyId, '\r\n');
            } else if (ch >= ' ') {
                lineBuffer += ch;
                term.write(ch);
            }
            previousChar = ch;
        }
    }

    term.onData((data) => {
        if (lineMode) handleLineInput(data);
        else window.api.input(ptyId, data);
    });

    window.api.onData((id, data) => {
        if (id === ptyId) term.write(data);
    });

    window.api.onMode((id, mode) => {
        if (id === ptyId) lineMode = mode === 'line';
    });
}

export { bindInput };