const { Menu } = require('electron');

class TrayMenuBuilder {
    constructor({ ptyOrchestrator, onOpenWindow, onQuit }) {
        this._pty = ptyOrchestrator;
        this._onOpenWindow = onOpenWindow;
        this._onQuit = onQuit;
    }

    build() {
        const sessions = this._pty.listDetachedSessions();

        const sessionItems = sessions.map((session) => ({
            label: `${session.title}  (${session.id.slice(0, 8)})`,
            enabled: false
        }));

        return Menu.buildFromTemplate([
            { label: `Sessions: ${sessions.length}`, enabled: false },
            { type: 'separator' },
            ...sessionItems,
            { type: 'separator' },
            { label: 'Open Window', click: () => this._onOpenWindow && this._onOpenWindow() },
            { label: 'Quit (kill all)', click: () => this._onQuit && this._onQuit() }
        ]);
    }
}

module.exports = { TrayMenuBuilder };