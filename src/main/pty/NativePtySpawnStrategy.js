const pty = require('node-pty');

class NativePtySpawnStrategy {
    constructor({ envBuilder, logger = console } = {}) {
        this._envBuilder = envBuilder;
        this._logger = logger;
    }

    spawn({ cols, rows }) {
        const shell = this._envBuilder.getShell();
        const args = this._envBuilder.getShellArguments();
        const cwd = this._envBuilder.getWorkingDirectory();
        const env = this._envBuilder.buildEnvironment();

        return pty.spawn(shell, args, {
            name: 'xterm-256color',
            cols,
            rows,
            cwd,
            env,
            useConpty: true
        });
    }
}

module.exports = { NativePtySpawnStrategy };