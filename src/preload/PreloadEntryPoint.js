const { contextBridge, ipcRenderer } = require('electron');

const IPC_CHANNELS = Object.freeze({
    PTY_CREATE: 'pty:create',
    PTY_KILL: 'pty:kill',
    PTY_INPUT: 'pty:input',
    PTY_RESIZE_ACTIVE: 'pty:resize-active',
    PTY_EXISTS: 'pty:exists',
    PTY_REATTACH: 'pty:reattach',
    PTY_DETACH: 'pty:detach',
    PTY_GET_DETACHED: 'pty:get-detached',
    PTY_ATTACH: 'pty:attach',
    PTY_TRANSFER: 'pty:transfer',
    PTY_DATA: 'pty:data',
    PTY_MODE: 'pty:mode',
    PTY_ADOPT: 'pty:adopt',
    WINDOW_KIND: 'window:kind',
    WINDOW_INIT: 'window:init',
    WINDOW_MIN: 'win:min',
    WINDOW_MAX: 'win:max',
    WINDOW_CLOSE: 'win:close',
    WINDOW_GET_BOUNDS: 'win:getBounds',
    WINDOW_SET_BOUNDS: 'win:setBounds',
    WINDOW_PIN: 'win:pin',
    WINDOW_MAX_STATE: 'win:maxstate',
    WINDOW_NEW_ARTIFICIAL: 'window:new-artificial-with-pty',
    WINDOW_CREATE_ARTIFICIAL: 'window:create-artificial',
    WINDOW_SPAWN_ARTIFICIAL: 'window:spawn-artificial',
    DRAG_START: 'drag:start',
    DRAG_END: 'drag:end',
    DRAG_HOVER: 'drag:hover',
    GHOST_INIT: 'ghost:init',
    GHOST_UPDATE: 'ghost:update',
    CLIP_READ: 'clip:read',
    CLIP_WRITE: 'clip:write'
});

function defineApiSurface() {
    return {
        createPty: (id, cols, rows) =>
            ipcRenderer.send(IPC_CHANNELS.PTY_CREATE, { id, cols, rows }),

        killPty: (id) =>
            ipcRenderer.send(IPC_CHANNELS.PTY_KILL, id),

        input: (id, data) =>
            ipcRenderer.send(IPC_CHANNELS.PTY_INPUT, { id, data }),

        resize: (cols, rows) =>
            ipcRenderer.send(IPC_CHANNELS.PTY_RESIZE_ACTIVE, { cols, rows }),

        onData: (callback) =>
            ipcRenderer.on(IPC_CHANNELS.PTY_DATA, (_, id, data) => callback(id, data)),

        onMode: (callback) =>
            ipcRenderer.on(IPC_CHANNELS.PTY_MODE, (_, id, mode) => callback(id, mode)),

        onWindowKind: (callback) =>
            ipcRenderer.on(IPC_CHANNELS.WINDOW_KIND, (_, payload) => callback(payload)),

        onWindowInit: (callback) =>
            ipcRenderer.on(IPC_CHANNELS.WINDOW_INIT, (_, payload) => callback(payload)),

        onAdopt: (callback) =>
            ipcRenderer.on(IPC_CHANNELS.PTY_ADOPT, (_, payload) => callback(payload)),

        onDragHover: (callback) =>
            ipcRenderer.on(IPC_CHANNELS.DRAG_HOVER, (_, payload) => callback(payload)),

        onGhostInit: (callback) =>
            ipcRenderer.on(IPC_CHANNELS.GHOST_INIT, (_, payload) => callback(payload)),

        onGhostUpdate: (callback) =>
            ipcRenderer.on(IPC_CHANNELS.GHOST_UPDATE, (_, payload) => callback(payload)),

        existsPty: (id) =>
            ipcRenderer.invoke(IPC_CHANNELS.PTY_EXISTS, id),

        reattachPty: (id) =>
            ipcRenderer.send(IPC_CHANNELS.PTY_REATTACH, { id }),

        transferPty: (ptyId, title, targetWebContentsId) =>
            ipcRenderer.send(IPC_CHANNELS.PTY_TRANSFER, { ptyId, title, targetWebContentsId }),

        detachPty: (id, title) =>
            ipcRenderer.invoke(IPC_CHANNELS.PTY_DETACH, id, title),

        getDetachedPtys: () =>
            ipcRenderer.invoke(IPC_CHANNELS.PTY_GET_DETACHED),

        attachPty: (id) =>
            ipcRenderer.invoke(IPC_CHANNELS.PTY_ATTACH, id),

        dragStart: (width, height, title) =>
            ipcRenderer.send(IPC_CHANNELS.DRAG_START, { width, height, title }),

        dragEnd: () =>
            ipcRenderer.send(IPC_CHANNELS.DRAG_END),

        newArtificialWindowWithPty: (ptyId, title, bounds) =>
            ipcRenderer.send(IPC_CHANNELS.WINDOW_NEW_ARTIFICIAL, { ptyId, title, bounds }),

        minimize: () =>
            ipcRenderer.send(IPC_CHANNELS.WINDOW_MIN),

        toggleMax: () =>
            ipcRenderer.send(IPC_CHANNELS.WINDOW_MAX),

        close: () =>
            ipcRenderer.send(IPC_CHANNELS.WINDOW_CLOSE),

        onMaxState: (callback) =>
            ipcRenderer.on(IPC_CHANNELS.WINDOW_MAX_STATE, (_, value) => callback(value)),

        getBounds: () =>
            ipcRenderer.invoke(IPC_CHANNELS.WINDOW_GET_BOUNDS),

        setBounds: (bounds) =>
            ipcRenderer.send(IPC_CHANNELS.WINDOW_SET_BOUNDS, bounds),

        readClipboard: () =>
            ipcRenderer.invoke(IPC_CHANNELS.CLIP_READ),

        writeClipboard: (text) =>
            ipcRenderer.send(IPC_CHANNELS.CLIP_WRITE, text)
    };
}

contextBridge.exposeInMainWorld('api', defineApiSurface());