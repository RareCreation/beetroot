import { init as initMaxStateListener } from './WindowMaxStateListener.js';

function init() {
    document.getElementById('btn-close').onclick = () => window.api.close();
    document.getElementById('btn-min').onclick = () => window.api.minimize();
    document.getElementById('btn-max').onclick = () => window.api.toggleMax();

    initMaxStateListener();

    document.getElementById('titlebar').addEventListener('dblclick', (event) => {
        if (event.target.closest('button')) return;
        window.api.toggleMax();
    });
}

export { init };