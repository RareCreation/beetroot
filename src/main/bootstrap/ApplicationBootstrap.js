const { DependencyContainer } = require('./DependencyContainer');
const { SingleInstanceGuard } = require('./SingleInstanceGuard');
const { UncaughtExceptionBoundary } = require('./UncaughtExceptionBoundary');
const { LifecycleOrchestrator } = require('./LifecycleOrchestrator');
const { BrowserWindowFactory } = require('../window/BrowserWindowFactory');
const { WindowRegistry } = require('../window/WindowRegistry');
const { WindowStateManager } = require('../window/WindowStateManager');
const { GhostWindowController } = require('../window/GhostWindowController');
const { WindowHitTestResolver } = require('../window/WindowHitTestResolver');
const { PtyRegistry } = require('../pty/PtyRegistry');
const { DetachedSessionStore } = require('../pty/DetachedSessionStore');
const { ShellEnvironmentBuilder } = require('../pty/ShellEnvironmentBuilder');
const { NativePtySpawnStrategy } = require('../pty/NativePtySpawnStrategy');
const { FallbackSpawnStrategy } = require('../pty/FallbackSpawnStrategy');
const { PtyOrchestrator } = require('../pty/PtyOrchestrator');
const { ClipboardGateway } = require('../clipboard/ClipboardGateway');
const { TrayMenuBuilder } = require('../tray/TrayMenuBuilder');
const { TrayController } = require('../tray/TrayController');
const { IpcRegistry } = require('../ipc/IpcRegistry');
const { PtyIpcHandler } = require('../ipc/PtyIpcHandler');
const { WindowIpcHandler } = require('../ipc/WindowIpcHandler');
const { ClipboardIpcHandler } = require('../ipc/ClipboardIpcHandler');
const { TabDragIpcHandler } = require('../ipc/TabDragIpcHandler');

class ApplicationBootstrap {
    constructor({ logger = console } = {}) {
        this._logger = logger;
        this._container = new DependencyContainer();
        this._guard = null;
        this._boundary = null;
        this._lifecycle = null;
        this._tray = null;
    }

    run() {
        this._registerCore();
        this._registerWindowSubsystem();
        this._registerPtySubsystem();
        this._registerClipboardSubsystem();
        this._registerTraySubsystem();
        this._registerIpcSubsystem();

        this._boundary = new UncaughtExceptionBoundary({ logger: this._logger });
        this._boundary.install();

        this._guard = new SingleInstanceGuard({
            onSecondInstance: () => this._restorePrimaryWindow()
        });

        if (!this._guard.acquire()) return;

        this._lifecycle = new LifecycleOrchestrator({
            onReady: () => this._onReady(),
            onWindowAllClosed: () => this._onWindowAllClosed(),
            onBeforeQuit: () => this._onBeforeQuit(),
            onWillQuit: () => this._onWillQuit()
        });
        this._lifecycle.bind();
    }

    _registerCore() {
        this._container.registerValue('logger', this._logger);
        this._container.registerValue('container', this._container);
    }

    _registerWindowSubsystem() {
        const c = this._container;

        c.register('windowRegistry', () => new WindowRegistry());
        c.register('windowStateManager', () => new WindowStateManager());
        c.register('windowHitTestResolver', (d) => new WindowHitTestResolver({
            registry: d.resolve('windowRegistry')
        }));
        c.register('browserWindowFactory', (d) => new BrowserWindowFactory({
            registry: d.resolve('windowRegistry'),
            stateManager: d.resolve('windowStateManager')
        }));
        c.register('ghostWindowController', (d) => new GhostWindowController({
            logger: d.resolve('logger')
        }));
    }

    _registerPtySubsystem() {
        const c = this._container;

        c.register('ptyRegistry', () => new PtyRegistry());
        c.register('detachedSessionStore', () => new DetachedSessionStore());
        c.register('shellEnvironmentBuilder', () => new ShellEnvironmentBuilder());
        c.register('nativePtySpawnStrategy', (d) => new NativePtySpawnStrategy({
            envBuilder: d.resolve('shellEnvironmentBuilder'),
            logger: d.resolve('logger')
        }));
        c.register('fallbackSpawnStrategy', (d) => new FallbackSpawnStrategy({
            envBuilder: d.resolve('shellEnvironmentBuilder'),
            logger: d.resolve('logger')
        }));
        c.register('ptyOrchestrator', (d) => new PtyOrchestrator({
            registry: d.resolve('ptyRegistry'),
            detachedStore: d.resolve('detachedSessionStore'),
            nativeStrategy: d.resolve('nativePtySpawnStrategy'),
            fallbackStrategy: d.resolve('fallbackSpawnStrategy'),
            windowRegistry: d.resolve('windowRegistry'),
            logger: d.resolve('logger')
        }));
    }

    _registerClipboardSubsystem() {
        this._container.register('clipboardGateway', () => new ClipboardGateway());
    }

    _registerTraySubsystem() {
        const c = this._container;
        c.register('trayMenuBuilder', (d) => new TrayMenuBuilder({
            ptyOrchestrator: d.resolve('ptyOrchestrator')
        }));
        c.register('trayController', (d) => new TrayController({
            menuBuilder: d.resolve('trayMenuBuilder'),
            onOpenWindow: () => this._restorePrimaryWindow(),
            onQuit: () => this._quitAll(),
            logger: d.resolve('logger')
        }));
    }

    _registerIpcSubsystem() {
        const c = this._container;

        c.register('ptyIpcHandler', (d) => new PtyIpcHandler({
            ptyOrchestrator: d.resolve('ptyOrchestrator'),
            windowRegistry: d.resolve('windowRegistry'),
            browserWindowFactory: d.resolve('browserWindowFactory')
        }));
        c.register('windowIpcHandler', (d) => new WindowIpcHandler({
            windowRegistry: d.resolve('windowRegistry'),
            windowStateManager: d.resolve('windowStateManager'),
            browserWindowFactory: d.resolve('browserWindowFactory')
        }));
        c.register('clipboardIpcHandler', (d) => new ClipboardIpcHandler({
            clipboardGateway: d.resolve('clipboardGateway')
        }));
        c.register('tabDragIpcHandler', (d) => new TabDragIpcHandler({
            windowRegistry: d.resolve('windowRegistry'),
            windowHitTestResolver: d.resolve('windowHitTestResolver'),
            ghostWindowController: d.resolve('ghostWindowController'),
            ptyOrchestrator: d.resolve('ptyOrchestrator')
        }));
        c.register('ipcRegistry', (d) => new IpcRegistry({
            handlers: [
                d.resolve('ptyIpcHandler'),
                d.resolve('windowIpcHandler'),
                d.resolve('clipboardIpcHandler'),
                d.resolve('tabDragIpcHandler')
            ]
        }));
    }

    _onReady() {
        const ipcRegistry = this._container.resolve('ipcRegistry');
        ipcRegistry.registerAll();

        const factory = this._container.resolve('browserWindowFactory');
        factory.create({ kind: 'native' });
    }

    _onWindowAllClosed() {
        const ptyOrchestrator = this._container.resolve('ptyOrchestrator');
        const detached = ptyOrchestrator.listDetachedSessions();

        if (detached.length > 0) {
            if (!this._tray) {
                this._tray = this._container.resolve('trayController');
                this._tray.create();
            }
            return;
        }

        const { app } = require('electron');
        app.quit();
    }

    _onBeforeQuit() {
        try {
            const { session } = require('electron');
            session.defaultSession.flushStorageData();
        } catch (_) {}
    }

    _onWillQuit() {
        const ptyOrchestrator = this._container.resolve('ptyOrchestrator');
        ptyOrchestrator.killAll();
    }

    _restorePrimaryWindow() {
        const registry = this._container.resolve('windowRegistry');
        const windows = registry.getAll();

        if (windows.length > 0) {
            const win = windows[0];
            if (win.isMinimized()) win.restore();
            win.show();
            win.focus();
            return;
        }

        const factory = this._container.resolve('browserWindowFactory');
        factory.create({ kind: 'native' });

        if (this._tray) {
            this._tray.destroy();
            this._tray = null;
        }
    }

    _quitAll() {
        const ptyOrchestrator = this._container.resolve('ptyOrchestrator');
        ptyOrchestrator.killAll();
        const { app } = require('electron');
        app.quit();
    }
}

module.exports = { ApplicationBootstrap };