const { ipcMain, screen } = require('electron');

const TICK_INTERVAL_MS = 16;

class TabDragIpcHandler {
    constructor({
                    windowRegistry,
                    windowHitTestResolver,
                    ghostWindowController,
                    ptyOrchestrator
                }) {
        this._windows = windowRegistry;
        this._hitTest = windowHitTestResolver;
        this._ghost = ghostWindowController;
        this._pty = ptyOrchestrator;

        this._timer = null;
        this._sourceWindow = null;
        this._ghostSize = { width: 160, height: 26 };
        this._startPoint = { x: 0, y: 0 };
        this._title = 'Terminal';
    }

    register() {
        ipcMain.on('drag:start', (event, payload) => {
            this._onStart(event, payload);
        });

        ipcMain.on('drag:end', () => {
            this._onEnd();
        });
    }

    _onStart(event, payload) {
        this._sourceWindow = this._windows.findByWebContentsId(event.sender.id);
        this._ghostSize = {
            width: Math.max(80, payload.width || 160),
            height: Math.max(20, payload.height || 26)
        };
        this._title = payload.title || 'Terminal';

        this._stopTimer();
        this._ghost.destroy();

        const point = screen.getCursorScreenPoint();
        this._startPoint = { x: point.x, y: point.y };

        const ghost = this._ghost.ensure({
            x: Math.round(point.x - this._ghostSize.width / 2),
            y: Math.round(point.y - this._ghostSize.height / 2),
            width: this._ghostSize.width,
            height: this._ghostSize.height
        });

        ghost.webContents.once('did-finish-load', () => {
            this._ghost.send('ghost:update', {
                title: this._title,
                targetId: null,
                rotate: 0,
                scale: 1.06
            });
            this._ghost.show();
        });

        this._timer = setInterval(() => this._tick(), TICK_INTERVAL_MS);
    }

    _tick() {
        if (!this._sourceWindow || this._sourceWindow.isDestroyed()) return;

        const point = screen.getCursorScreenPoint();
        const target = this._hitTest.resolveScreenPoint(point.x, point.y, this._sourceWindow);

        const dx = point.x - this._startPoint.x;
        const dy = point.y - this._startPoint.y;
        const rotate = Math.max(-12, Math.min(12, dx * 0.04));
        const scale = target ? 1.15 : (Math.abs(dy) > 40 ? 1.12 : 1.06);

        this._ghost.updatePosition({
            x: point.x - this._ghostSize.width / 2,
            y: point.y - this._ghostSize.height / 2,
            width: this._ghostSize.width,
            height: this._ghostSize.height
        });

        this._ghost.send('ghost:update', {
            title: this._title,
            targetId: target ? target.webContents.id : null,
            rotate,
            scale
        });

        this._sourceWindow.webContents.send('drag:hover', {
            targetId: target ? target.webContents.id : null,
            x: point.x,
            y: point.y
        });
    }

    _onEnd() {
        this._stopTimer();
        this._sourceWindow = null;
        this._ghost.destroy();
    }

    _stopTimer() {
        if (this._timer) {
            clearInterval(this._timer);
            this._timer = null;
        }
    }
}

module.exports = { TabDragIpcHandler };