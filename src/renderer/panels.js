function init() {
    const settingsPanel = document.getElementById('settings');
    const clipboardPanel = document.getElementById('clipboard-panel');

    return {
        settingsPanel,
        clipboardPanel,
        openSettings() {
            clipboardPanel.classList.add('hidden');
            settingsPanel.classList.toggle('hidden');
        },
        closeSettings() {
            settingsPanel.classList.add('hidden');
        },
        toggleClipboard() {
            settingsPanel.classList.add('hidden');
            const wasHidden = clipboardPanel.classList.contains('hidden');
            clipboardPanel.classList.toggle('hidden');
            return wasHidden;
        },
        closeClipboard() {
            clipboardPanel.classList.add('hidden');
        },
        handleOutsideClick(e) {
            if (!settingsPanel.classList.contains('hidden')) {
                if (!settingsPanel.contains(e.target) && !e.target.closest('#btn-settings')) {
                    settingsPanel.classList.add('hidden');
                }
            }
            if (!clipboardPanel.classList.contains('hidden')) {
                if (!clipboardPanel.contains(e.target) && !e.target.closest('#btn-clipboard')) {
                    clipboardPanel.classList.add('hidden');
                }
            }
        }
    };
}

export { init };