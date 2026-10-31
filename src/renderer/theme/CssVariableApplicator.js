function applyPaletteToCss(palette) {
    if (!palette) return;
    const style = document.documentElement.style;
    style.setProperty('--win-bg', palette.win);
    style.setProperty('--frame-bg', palette.frame);
    style.setProperty('--frame-line', palette.line);
    style.setProperty('--title', palette.title);
    style.setProperty('--scroll', palette.scroll);
    style.setProperty('--term-bg-1', palette.t1);
    style.setProperty('--term-bg-2', palette.t2);
    style.setProperty('--term-bg-3', palette.t3);
    style.setProperty('--term-bg-4', palette.t4);
}

function applyCssVariableMap(cssMap) {
    if (!cssMap) return;
    const style = document.documentElement.style;
    for (const [key, value] of Object.entries(cssMap)) {
        style.setProperty(key, value);
    }
}

export { applyPaletteToCss, applyCssVariableMap };