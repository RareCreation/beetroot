import { SettingsPanel } from './SettingsPanel.js';
import { ClipboardPanel } from './ClipboardPanel.js';
import { SessionsPanel } from './SessionsPanel.js';

function init() {
    const settings = new SettingsPanel({ element: document.getElementById('settings') });
    const clipboard = new ClipboardPanel({ element: document.getElementById('clipboard-panel') });
    const sessions = new SessionsPanel({ element: document.getElementById('sessions-panel') });

    return {
        openSettings() {
            clipboard.close();
            sessions.close();
            settings.toggle();
        },
        closeSettings() {
            settings.close();
        },
        toggleClipboard() {
            settings.close();
            sessions.close();
            return clipboard.toggle();
        },
        closeClipboard() {
            clipboard.close();
        },
        handleOutsideClick(event) {
            if (settings.isOpen()) {
                if (!settings.contains(event.target) && !event.target.closest('#btn-settings')) {
                    settings.close();
                }
            }
            if (clipboard.isOpen()) {
                if (!clipboard.contains(event.target) && !event.target.closest('#btn-clipboard')) {
                    clipboard.close();
                }
            }
        }
    };
}

export { init };