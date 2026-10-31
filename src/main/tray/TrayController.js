const { Tray, nativeImage } = require('electron');
const path = require('path');

class TrayController {
    constructor({ menuBuilder, onOpenWindow, onQuit, logger = console }) {
        this._menuBuilder = menuBuilder;
        this._onOpenWindow = onOpenWindow;
        this._onQuit = onQuit;
        this._logger = logger;
        this._tray = null;
    }

    create() {
        if (this._tray) return this._tray;

        const iconPath = path.join(__dirname, '..', '..', 'assets', 'icon.ico');
        let icon;
        try {
            icon = nativeImage.createFromPath(iconPath);
        } catch (_) {
            icon = null;
        }
        if (!icon || icon.isEmpty()) icon = nativeImage.createEmpty();

        this._tray = new Tray(icon);
        this._tray.setToolTip('BEETROOT — background sessions');
        this._tray.setContextMenu(this._menuBuilder.build());
        this._tray.on('double-click', () => {
            if (this._onOpenWindow) this._onOpenWindow();
        });

        return this._tray;
    }

    rebuild() {
        if (!this._tray) return;
        this._tray.setContextMenu(this._menuBuilder.build());
    }

    destroy() {
        if (this._tray) {
            this._tray.destroy();
            this._tray = null;
        }
    }
}

module.exports = { TrayController };