const WHEEL_STEP = 120;
const WHEEL_LINES = 0.5;

function attachWheelScrollHandler(container, term) {
    let accumulated = 0;

    const handler = (event) => {
        if (event.deltaY === 0) return;
        event.preventDefault();

        accumulated += event.deltaY;
        const lines = Math.trunc((accumulated / WHEEL_STEP) * WHEEL_LINES);

        if (lines !== 0) {
            accumulated -= (lines / WHEEL_LINES) * WHEEL_STEP;
            term.scrollLines(lines);
        }
    };

    container.addEventListener('wheel', handler, { passive: false });

    return () => container.removeEventListener('wheel', handler);
}

export { attachWheelScrollHandler };