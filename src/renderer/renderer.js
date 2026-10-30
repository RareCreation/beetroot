import { getId, applyTheme, buildThemeList } from './theme-manager.js';
import { createTabsManager } from './tabs.js';
import * as clipboard from './clipboard.js';
import * as panels from './panels.js';
import * as windowControls from './window-controls.js';
import * as resize from './resize.js';
import * as search from './search.js';
import * as sessions from './sessions.js';

applyTheme(getId(), null, null);

let windowKind = null;
let tabsManager = null;
let pendingInit = undefined;
let booted = false;

window.api.onWindowKind(function(data) {
  windowKind = data.kind;
  tryBoot();
});

window.api.onWindowInit(function(data) {
  if (tabsManager) {
    if (data.ptyId) tabsManager.adoptTab(data.ptyId, data.title || null);
  } else {
    pendingInit = data;
    tryBoot();
  }
});

window.api.onAdopt(function(data) {
  if (tabsManager) tabsManager.adoptTab(data.ptyId, data.title || null);
  sessions.refresh();
  if (typeof window.__refreshSessionsBadge === 'function') window.__refreshSessionsBadge();
});

function tryBoot() {
  if (booted) return;
  if (windowKind === null) return;
  booted = true;
  boot();
}

function boot() {
  const isNative = windowKind === 'native';

  if (isNative) {
    tabsManager = createTabsManager();
  } else {
    if (pendingInit && pendingInit.ptyId) {
      tabsManager = createTabsManager(undefined, undefined, true);
      tabsManager.adoptTab(pendingInit.ptyId, pendingInit.title || null);
    } else {
      tabsManager = createTabsManager(null, null, true);
    }
  }
  pendingInit = undefined;

  function getActiveTerm() {
    return tabsManager.getActiveTerminal();
  }

  window.addEventListener('error', function(e) {
    const term = getActiveTerm();
    if (term) try { term.write('\r\n\x1b[31m[bt] ' + e.message + '\x1b[0m\r\n'); } catch (err) {}
  });
  window.addEventListener('unhandledrejection', function(e) {
    const term = getActiveTerm();
    if (term) try { term.write('\r\n\x1b[31m[bt] ' + e.reason + '\x1b[0m\r\n'); } catch (err) {}
  });

  setTimeout(function() {
    const term = getActiveTerm();
    if (term) {
      window.api.resize(term.cols, term.rows);
      term.focus();
    }
  }, 100);

  clipboard.init(function() { return getActiveTerm(); });
  const p = panels.init();
  windowControls.init();
  resize.init();
  search.init(function() { return getActiveTerm(); }, function() { return tabsManager.getActiveSearchAddon(); });

  sessions.init(function(id, title) {
    tabsManager.adoptTab(id, title);
  });

  tabsManager.onSessionChange = function() {
    sessions.refresh();
    showToast('Session detached to background', function() {
      const btn = document.getElementById('btn-sessions');
      if (btn) btn.click();
    });
  };

  document.getElementById('btn-settings').onclick = function() { p.openSettings(); };
  document.getElementById('settings-close').onclick = function() { p.closeSettings(); };

  document.getElementById('btn-clipboard').onclick = async function() {
    const wasHidden = p.toggleClipboard();
    if (wasHidden) await clipboard.refreshLast();
  };
  document.getElementById('clipboard-close').onclick = function() { p.closeClipboard(); };

  document.addEventListener('mousedown', function(e) {
    p.handleOutsideClick(e);
  });

  function setupTerminalHandlers(term) {
    if (!term || term.__bound) return;
    term.__bound = true;
    term.attachCustomKeyEventHandler(function(e) {
      if (e.type !== 'keydown') return true;

      const key = e.key.toLowerCase();

      if (e.ctrlKey && key === 'c' && term.hasSelection()) {
        window.api.writeClipboard(term.getSelection());
        term.clearSelection();
        return false;
      }
      if (e.ctrlKey && key === 'v') {
        e.preventDefault();
        e.stopPropagation();
        window.api.readClipboard().then(function(text) {
          if (text) term.paste(text);
        });
        return false;
      }
      if (e.ctrlKey && key === 'f') {
        e.preventDefault();
        e.stopPropagation();
        search.open();
        return false;
      }
      if (key === 'escape' && search.isOpen()) {
        e.preventDefault();
        e.stopPropagation();
        search.close();
        return false;
      }
      return true;
    });
  }

  document.getElementById('terminals-container').addEventListener('contextmenu', function(e) {
    e.preventDefault();
    const term = getActiveTerm();
    if (!term) return;
    if (term.hasSelection()) {
      window.api.writeClipboard(term.getSelection());
      term.clearSelection();
    } else {
      window.api.readClipboard().then(function(text) {
        if (text) term.paste(text);
      });
    }
  });

  document.addEventListener('mousedown', function(e) {
    if (e.target.closest('#sessions-panel') || e.target.closest('#btn-sessions')) return;
    const term = getActiveTerm();
    if (term) setTimeout(function() { term.focus(); }, 0);
  });

  window.addEventListener('focus', function() {
    const term = getActiveTerm();
    if (term) { term.focus(); term.options.cursorBlink = true; }
  });
  window.addEventListener('blur', function() {
    const term = getActiveTerm();
    if (term) term.options.cursorBlink = false;
  });

  buildThemeList(function(theme) {
    tabsManager.updateTheme(theme);
  });

  tabsManager.onTabCreated = function(term) { setupTerminalHandlers(term); };
  setupTerminalHandlers(getActiveTerm());

  setTimeout(function() {
    const t = getActiveTerm();
    if (t) t.focus();
    sessions.refresh();
  }, 50);
}

function showToast(message, onAction) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';

  const text = document.createElement('span');
  text.textContent = message;
  toast.appendChild(text);

  if (onAction) {
    const btn = document.createElement('button');
    btn.className = 'toast-btn';
    btn.textContent = 'View';
    btn.onclick = function() {
      onAction();
      toast.classList.add('hiding');
      setTimeout(function() { toast.remove(); }, 300);
    };
    toast.appendChild(btn);
  }

  container.appendChild(toast);

  setTimeout(function() {
    if (toast.parentNode) {
      toast.classList.add('hiding');
      setTimeout(function() { toast.remove(); }, 300);
    }
  }, 4000);
}