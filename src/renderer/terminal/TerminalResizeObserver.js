function attachResizeObserver(container, doFit) {
    const observer = new ResizeObserver(() => {
        if (container.classList.contains('active')) doFit();
    });
    observer.observe(container);
    return observer;
}

export { attachResizeObserver };