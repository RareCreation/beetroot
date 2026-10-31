function init() {
    window.api.onMaxState((maximized) => {
        document.body.classList.toggle('max', maximized);
    });
}

export { init };