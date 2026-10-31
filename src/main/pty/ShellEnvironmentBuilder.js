const os = require('os');

const IS_WINDOWS = process.platform === 'win32';
const DEFAULT_SHELL = process.env.WT_SHELL || (IS_WINDOWS ? 'cmd.exe' : 'bash');
const IS_CMD = /(^|[\\/])cmd(\.exe)?$/i.test(DEFAULT_SHELL);

class ShellEnvironmentBuilder {
    constructor() {
        this._shell = DEFAULT_SHELL;
        this._isWindows = IS_WINDOWS;
        this._isCmd = IS_CMD;
    }

    getShell() {
        return this._shell;
    }

    getShellArguments() {
        if (this._isCmd) {
            return ['/K', 'chcp 65001>nul && cls'];
        }
        return [];
    }

    getWorkingDirectory() {
        return os.homedir();
    }

    buildEnvironment() {
        const env = {};
        for (const [key, value] of Object.entries(process.env)) {
            if (typeof value === 'string') env[key] = value;
        }
        if (this._isCmd && !process.env.WT_PLAIN) {
            env.PROMPT = this._buildPrompt();
        }
        env.LANG = 'en_US.UTF-8';
        env.LC_ALL = 'en_US.UTF-8';
        return env;
    }

    _buildPrompt() {
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
}

module.exports = { ShellEnvironmentBuilder };