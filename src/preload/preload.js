const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  ready: (cols, rows) => ipcRenderer.send('pty:ready', { cols, rows }),
  input: (d) => ipcRenderer.send('pty:input', d),
  resize: (cols, rows) => ipcRenderer.send('pty:resize', { cols, rows }),
  onData: (cb) => ipcRenderer.on('pty:data', (_, d) => cb(d)),
  onMode: (cb) => ipcRenderer.on('pty:mode', (_, m) => cb(m)),
  minimize: () => ipcRenderer.send('win:min'),
  toggleMax: () => ipcRenderer.send('win:max'),
  close: () => ipcRenderer.send('win:close'),
  onMaxState: (cb) => ipcRenderer.on('win:maxstate', (_, v) => cb(v)),
  getBounds: () => ipcRenderer.invoke('win:getBounds'),
  setBounds: (b) => ipcRenderer.send('win:setBounds', b),
  readClipboard: () => ipcRenderer.invoke('clip:read'),
  writeClipboard: (t) => ipcRenderer.send('clip:write', t)
});