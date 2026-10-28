import { THEMES } from './themes.js';
import { getId, applyTheme, buildThemeList } from './theme-manager.js';
import { createTerminal, bindInput } from './terminal.js';
import * as clipboard from './clipboard.js';
import * as panels from './panels.js';
import * as windowControls from './window-controls.js';
import * as resize from './resize.js';

const initialId = getId();
applyTheme(initialId, null);

const theme = THEMES[initialId].term;
const { term, doFit } = createTerminal(theme);

bindInput(term);

window.addEventListener('error', (e) => {
  try { term.write(`\r\n\x1b[31m[bt] ${e.message}\x1b[0m\r\n`); } catch {}
});
window.addEventListener('unhandledrejection', (e) => {
  try { term.write(`\r\n\x1b[31m[bt] ${e.reason}\x1b[0m\r\n`); } catch {}
});

doFit();
window.api.ready(term.cols, term.rows);
term.focus();

clipboard.init(term);
const p = panels.init();
windowControls.init();
resize.init();

document.getElementById('btn-settings').onclick = () => p.openSettings();
document.getElementById('settings-close').onclick = () => p.closeSettings();

document.getElementById('btn-clipboard').onclick = async () => {
  const wasHidden = p.toggleClipboard();
  if (wasHidden) {
    await clipboard.refreshLast();
  }
};
document.getElementById('clipboard-close').onclick = () => p.closeClipboard();

document.addEventListener('mousedown', (e) => p.handleOutsideClick(e));

term.attachCustomKeyEventHandler((e) => {
  if (e.type !== 'keydown' || !e.ctrlKey) return true;
  if (e.key === 'c' && term.hasSelection()) {
    window.api.writeClipboard(term.getSelection());
    term.clearSelection();
    return false;
  }
  if (e.key === 'v') {
    e.preventDefault();
    e.stopPropagation();
    window.api.readClipboard().then((text) => {
      if (text) term.paste(text);
    });
    return false;
  }
  return true;
});

document.getElementById('terminal').addEventListener('contextmenu', (e) => {
  e.preventDefault();
  if (term.hasSelection()) {
    window.api.writeClipboard(term.getSelection());
    term.clearSelection();
  } else {
    window.api.readClipboard().then((text) => {
      if (text) term.paste(text);
    });
  }
});

setTimeout(() => term.focus(), 50);
document.addEventListener('mousedown', () => setTimeout(() => term.focus(), 0));
window.addEventListener('focus', () => { term.focus(); term.options.cursorBlink = true; });
window.addEventListener('blur', () => { term.options.cursorBlink = false; });

buildThemeList(term);