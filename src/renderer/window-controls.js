function init() {
    document.getElementById('btn-close').onclick = () => window.api.close();
    document.getElementById('btn-min').onclick = () => window.api.minimize();
    document.getElementById('btn-max').onclick = () => window.api.toggleMax();

    window.api.onMaxState((m) => document.body.classList.toggle('max', m));

    document.getElementById('titlebar').addEventListener('dblclick', (e) => {
        if (e.target.closest('button')) return;
        window.api.toggleMax();
    });
}

export { init };