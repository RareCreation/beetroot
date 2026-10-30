const os = require('os');
const cp = require('child_process');
const { StringDecoder } = require('string_decoder');
const { sendToWindow, getAllWindows } = require('./window');

let pty = null;
let ptyError = null;
try { pty = require('node-pty'); } catch (e) { ptyError = e; }

const IS_WIN = process.platform === 'win32';
const SHELL = process.env.WT_SHELL || (IS_WIN ? 'cmd.exe' : 'bash');
const IS_CMD = /(^|[\\/])cmd(\.exe)?$/i.test(SHELL);

const instances = new Map();
const detachedSessions = new Map();
let activeId = null;

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

function sendToTarget(id, ch, ...a) {
    const inst = instances.get(id);
    if (!inst) return;
    if (inst.targetWin && !inst.targetWin.isDestroyed()) {
        sendToWindow(inst.targetWin, ch, ...a);
    } else if (getAllWindows()[0]) {
        sendToWindow(getAllWindows()[0], ch, ...a);
    }
}

function info(id, msg, color = '33') {
    console.log('[beetroot]', msg);
    sendToTarget(id, 'pty:data', id, `\r\n\x1b[${color}m[bt] ${msg}\x1b[0m\r\n`);
}

function startFallback(id, reason) {
    info(id, `${reason}. Fallback mode: ${SHELL} without pty.`);
    sendToTarget(id, 'pty:mode', id, 'line');
    const args = IS_CMD ? ['/K', 'chcp 65001>nul'] : [];
    try {
        const fb = cp.spawn(SHELL, args, { cwd: os.homedir(), env: cleanEnv(), windowsHide: true });
        const pipe = (stream) => {
            const dec = new StringDecoder('utf8');
            stream.on('data', (d) => {
                if (!detachedSessions.has(id)) {
                    sendToTarget(id, 'pty:data', id, dec.write(d).replace(/\r?\n/g, '\r\n'));
                }
            });
        };
        pipe(fb.stdout);
        pipe(fb.stderr);
        fb.on('error', (e) => info(id, `${SHELL} error: ${e.message}`, '31'));
        fb.on('exit', () => {
            instances.delete(id);
            detachedSessions.delete(id);
        });

        instances.set(id, { type: 'fallback', proc: fb, targetWin: getAllWindows()[0] || null });
    } catch (e) {
        info(id, `failed to start ${SHELL}: ${e.message}`, '31');
    }
}

function create(id, cols, rows) {
    if (instances.has(id) || detachedSessions.has(id)) return;
    if (process.env.WT_FORCE_FALLBACK) {
        startFallback(id, 'forced (WT_FORCE_FALLBACK)');
        return;
    }
    if (!pty) {
        startFallback(id, `node-pty failed: ${ptyError && ptyError.message}`);
        return;
    }

    const args = IS_CMD ? ['/K', 'chcp 65001>nul && cls'] : [];

    try {
        const term = pty.spawn(SHELL, args, {
            name: 'xterm-256color',
            cols,
            rows,
            cwd: os.homedir(),
            env: cleanEnv(),
            useConpty: true
        });

        const t0 = Date.now();

        term.onData((d) => {
            if (!detachedSessions.has(id)) {
                sendToTarget(id, 'pty:data', id, d);
            }
        });

        term.onExit(({ exitCode }) => {
            const inst = instances.get(id);
            if (inst && inst.type === 'fallback') return;
            if (Date.now() - t0 < 3000) info(id, `${SHELL} exited early with code ${exitCode}`, '31');
            instances.delete(id);
            detachedSessions.delete(id);
        });

        instances.set(id, { type: 'pty', term, targetWin: getAllWindows()[0] || null });
        activeId = id;
    } catch (err) {
        startFallback(id, `ConPTY start failed: ${err.message}`);
    }
}

function detach(id, title) {
    const inst = instances.get(id);
    if (!inst) return false;
    detachedSessions.set(id, { inst, title: title || 'Restored Session' });
    inst.targetWin = null;
    instances.delete(id);
    return true;
}

function attach(id, targetWin) {
    const data = detachedSessions.get(id);
    if (!data) {
        console.warn('[PTY] attach: not in detached', id);
        return false;
    }
    const inst = data.inst;
    const title = data.title || 'Restored Session';

    inst.targetWin = targetWin;
    detachedSessions.delete(id);
    instances.set(id, inst);
    sendToWindow(targetWin, 'pty:adopt', { ptyId: id, title });
    console.log('[PTY] attach OK', id, 'detached remaining=', detachedSessions.size);
    return true;
}

function getDetachedSessions() {
    return Array.from(detachedSessions.entries()).map(([id, data]) => ({
        id,
        title: data.title
    }));
}

function setTargetWindow(id, win) {
    const inst = instances.get(id);
    if (inst) inst.targetWin = win;
}

function reattach(id) {
    const inst = instances.get(id);
    if (!inst) return;
    if (inst.type === 'pty') {
        try { inst.term.resize(80, 24); } catch {}
    }
}

function exists(id) {
    return instances.has(id) || detachedSessions.has(id);
}

function kill(id) {
    const data = instances.get(id) || detachedSessions.get(id);
    if (!data) return;
    const inst = data.inst || data;
    if (inst.type === 'pty') {
        try { inst.term.kill(); } catch {}
    } else if (inst.type === 'fallback') {
        try { inst.proc.kill(); } catch {}
    }
    instances.delete(id);
    detachedSessions.delete(id);
}

function input(id, d) {
    const data = instances.get(id) || detachedSessions.get(id);
    if (!data) return;
    const inst = data.inst || data;
    if (inst.type === 'fallback') {
        try { inst.proc.stdin.write(d); } catch {}
    } else if (inst.type === 'pty') {
        inst.term.write(d);
    }
}

function resizeActive(cols, rows) {
    if (!activeId) return;
    const data = instances.get(activeId) || detachedSessions.get(activeId);
    if (!data) return;
    const inst = data.inst || data;
    if (inst.type === 'pty') {
        try { inst.term.resize(cols, rows); } catch {}
    }
}

function setActive(id) { activeId = id; }

function killAll() {
    for (const [id] of instances) kill(id);
    for (const [id] of detachedSessions) kill(id);
}

module.exports = {
    create, kill, input, resizeActive, setActive, killAll,
    setTargetWindow, reattach, exists,
    detach, attach, getDetachedSessions
};