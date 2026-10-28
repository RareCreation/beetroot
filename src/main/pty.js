const os = require('os');
const cp = require('child_process');
const { StringDecoder } = require('string_decoder');
const { sendToWin } = require('./window');

let pty = null;
let ptyError = null;
try { pty = require('node-pty'); } catch (e) { ptyError = e; }

const IS_WIN = process.platform === 'win32';
const SHELL = process.env.WT_SHELL || (IS_WIN ? 'cmd.exe' : 'bash');
const IS_CMD = /(^|[\\/])cmd(\.exe)?$/i.test(SHELL);

let term = null;
let fb = null;

function buildPrompt() {
    const user = (os.userInfo().username || 'user').replace(/%/g, '');
    return (
        '$E[97m\u250C\u2500\u2500(' +
        '$E[1;97m' + user +
        '$E[0;97m)-[' +
        '$E[1;97m$P' +
        '$E[0;97m]$_' +
        '$E[97m\u2514\u2500' +
        '$E[1;97m$$' +
        '$E[0m '
    );
}

function cleanEnv() {
    const env = {};
    for (const [k, v] of Object.entries(process.env)) if (typeof v === 'string') env[k] = v;
    if (IS_CMD && !process.env.WT_PLAIN) env.PROMPT = buildPrompt();
    env.LANG = 'en_US.UTF-8';
    env.LC_ALL = 'en_US.UTF-8';
    return env;
}

function info(msg, color = '33') {
    console.log('[beetroot]', msg);
    sendToWin('pty:data', `\r\n\x1b[${color}m[bt] ${msg}\x1b[0m\r\n`);
}

function startFallback(reason) {
    info(`${reason}. Fallback mode: ${SHELL} without pty.`);
    sendToWin('pty:mode', 'line');
    const args = IS_CMD ? ['/K', 'chcp 65001>nul'] : [];
    try {
        fb = cp.spawn(SHELL, args, { cwd: os.homedir(), env: cleanEnv(), windowsHide: true });
    } catch (e) {
        return info(`failed to start ${SHELL}: ${e.message}`, '31');
    }
    const pipe = (stream) => {
        const dec = new StringDecoder('utf8');
        stream.on('data', (d) => sendToWin('pty:data', dec.write(d).replace(/\r?\n/g, '\r\n')));
    };
    pipe(fb.stdout);
    pipe(fb.stderr);
    fb.on('error', (e) => info(`${SHELL} error: ${e.message}`, '31'));
    fb.on('exit', () => process.exit(0));
}

function start(cols, rows) {
    if (process.env.WT_FORCE_FALLBACK) return startFallback('forced (WT_FORCE_FALLBACK)');
    if (!pty) return startFallback(`node-pty failed: ${ptyError && ptyError.message}`);

    const args = IS_CMD ? ['/K', 'chcp 65001>nul && cls'] : [];

    try {
        term = pty.spawn(SHELL, args, {
            name: 'xterm-256color',
            cols,
            rows,
            cwd: os.homedir(),
            env: cleanEnv(),
            useConpty: true
        });
    } catch (err) {
        return startFallback(`ConPTY start failed: ${err.message}`);
    }

    const t0 = Date.now();
    let got = false;

    term.onData((d) => {
        got = true;
        sendToWin('pty:data', d);
    });

    term.onExit(({ exitCode }) => {
        if (fb) return;
        if (Date.now() - t0 < 3000) return info(`${SHELL} exited early with code ${exitCode}`, '31');
        process.exit(0);
    });

    setTimeout(() => {
        if (got || fb) return;
        try { term.kill(); } catch {}
        term = null;
        startFallback('ConPTY returned no data within 4s');
    }, 4000);
}

function input(d) {
    if (fb) { try { fb.stdin.write(d); } catch {} }
    else if (term) term.write(d);
}

function resize(cols, rows) {
    try { term && term.resize(cols, rows); } catch {}
}

function kill() {
    try { term && term.kill(); } catch {}
    try { fb && fb.kill(); } catch {}
}

module.exports = { start, input, resize, kill };