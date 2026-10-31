const cp = require('child_process');
const { StringDecoder } = require('string_decoder');

class FallbackSpawnStrategy {
    constructor({ envBuilder, logger = console } = {}) {
        this._envBuilder = envBuilder;
        this._logger = logger;
    }

    spawn({ onData, onExit }) {
        const shell = this._envBuilder.getShell();
        const env = this._envBuilder.buildEnvironment();
        const cwd = this._envBuilder.getWorkingDirectory();

        const args = shell.toLowerCase().endsWith('cmd.exe')
            ? ['/K', 'chcp 65001>nul']
            : [];

        let proc;
        try {
            proc = cp.spawn(shell, args, { cwd, env, windowsHide: true });
        } catch (error) {
            this._logger.error(`[PTY] fallback spawn failed: ${error.message}`);
            if (typeof onExit === 'function') onExit({ exitCode: -1 });
            return null;
        }

        const decoder = new StringDecoder('utf8');

        const pipe = (stream) => {
            stream.on('data', (chunk) => {
                const text = decoder.write(chunk).replace(/\r?\n/g, '\r\n');
                if (typeof onData === 'function') onData(text);
            });
        };

        pipe(proc.stdout);
        pipe(proc.stderr);

        proc.on('error', (error) => {
            this._logger.error(`[PTY] fallback process error: ${error.message}`);
        });

        proc.on('exit', (code) => {
            if (typeof onExit === 'function') onExit({ exitCode: code });
        });

        return {
            write: (data) => {
                try { proc.stdin.write(data); } catch (_) {}
            },
            resize: () => {},
            kill: () => {
                try { proc.kill(); } catch (_) {}
            }
        };
    }
}

module.exports = { FallbackSpawnStrategy };