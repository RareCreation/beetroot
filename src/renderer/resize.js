const MIN_W = 480;
const MIN_H = 300;

function init() {
    document.querySelectorAll('.rz').forEach((el) => {
        el.addEventListener('pointerdown', async (e) => {
            e.preventDefault();
            el.setPointerCapture(e.pointerId);
            const dir = el.dataset.dir;
            const start = await window.api.getBounds();
            const sx = e.screenX;
            const sy = e.screenY;

            const move = (ev) => {
                const dx = ev.screenX - sx;
                const dy = ev.screenY - sy;
                let { x, y, width, height } = start;
                if (dir.includes('e')) width = Math.max(MIN_W, start.width + dx);
                if (dir.includes('s')) height = Math.max(MIN_H, start.height + dy);
                if (dir.includes('w')) { width = Math.max(MIN_W, start.width - dx); x = start.x + start.width - width; }
                if (dir.includes('n')) { height = Math.max(MIN_H, start.height - dy); y = start.y + start.height - height; }
                window.api.setBounds({ x, y, width, height });
            };
            const up = () => {
                el.removeEventListener('pointermove', move);
                el.removeEventListener('pointerup', up);
            };
            el.addEventListener('pointermove', move);
            el.addEventListener('pointerup', up);
        });
    });
}

export { init };