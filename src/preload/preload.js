const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  createPty: (id, cols, rows) => ipcRenderer.send('pty:create', { id, cols, rows }),
  killPty: (id) => ipcRenderer.send('pty:kill', id),
  input: (id, d) => ipcRenderer.send('pty:input', { id, data: d }),
  resize: (cols, rows) => ipcRenderer.send('pty:resize-active', { cols, rows }),
  onData: (cb) => ipcRenderer.on('pty:data', (_, id, d) => cb(id, d)),
  onMode: (cb) => ipcRenderer.on('pty:mode', (_, id, m) => cb(id, m)),
  onWindowKind: (cb) => ipcRenderer.on('window:kind', (_, data) => cb(data)),
  onWindowInit: (cb) => ipcRenderer.on('window:init', (_, data) => cb(data)),
  onAdopt: (cb) => ipcRenderer.on('pty:adopt', (_, data) => cb(data)),
  onDragHover: (cb) => ipcRenderer.on('drag:hover', (_, data) => cb(data)),
  onGhostInit: (cb) => ipcRenderer.on('ghost:init', (_, data) => cb(data)),
  onGhostUpdate: (cb) => ipcRenderer.on('ghost:update', (_, data) => cb(data)),
  existsPty: (id) => ipcRenderer.invoke('pty:exists', id),
  reattachPty: (id) => ipcRenderer.send('pty:reattach', { id }),
  transferPty: (ptyId, title, targetWebContentsId) => ipcRenderer.send('pty:transfer', { ptyId, title, targetWebContentsId }),

  detachPty: (id, title) => {
    console.log('[PRELOAD] detachPty invoke', id, title);
    return ipcRenderer.invoke('pty:detach', id, title)
        .then((r) => { console.log('[PRELOAD] detachPty resolved', id, r); return r; })
        .catch((e) => { console.error('[PRELOAD] detachPty rejected', id, e); throw e; });
  },
  getDetachedPtys: () => {
    return ipcRenderer.invoke('pty:get-detached')
        .then((r) => { console.log('[PRELOAD] getDetachedPtys resolved', r); return r; })
        .catch((e) => { console.error('[PRELOAD] getDetachedPtys rejected', e); throw e; });
  },
  attachPty: (id) => ipcRenderer.invoke('pty:attach', id),

  dragStart: (w, h, title) => ipcRenderer.send('drag:start', { width: w, height: h, title }),
  dragEnd: () => ipcRenderer.send('drag:end'),
  newArtificialWindowWithPty: (ptyId, title, bounds) => ipcRenderer.send('window:new-artificial-with-pty', { ptyId, title, bounds }),
  minimize: () => ipcRenderer.send('win:min'),
  toggleMax: () => ipcRenderer.send('win:max'),
  close: () => ipcRenderer.send('win:close'),
  onMaxState: (cb) => ipcRenderer.on('win:maxstate', (_, v) => cb(v)),
  getBounds: () => ipcRenderer.invoke('win:getBounds'),
  setBounds: (b) => ipcRenderer.send('win:setBounds', b),
  readClipboard: () => ipcRenderer.invoke('clip:read'),
  writeClipboard: (t) => ipcRenderer.send('clip:write', t)
});