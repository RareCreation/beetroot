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

module.exports = { IPC_CHANNELS };