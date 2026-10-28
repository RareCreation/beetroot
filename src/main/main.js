const { app } = require('electron');
const { createWindow, closeAll } = require('./window');
const { registerIpc } = require('./ipc');

process.on('uncaughtException', (e) => {
  console.error('[beetroot] uncaught', e);
});

app.whenReady().then(() => {
  registerIpc();
  createWindow();
});

app.on('window-all-closed', () => {
  closeAll();
  app.quit();
});