const MIN_WIDTH = 480;
const MIN_HEIGHT = 300;

function init() {
    document.querySelectorAll('.rz').forEach((el) => {
        el.addEventListener('pointerdown', async (event) => {
            event.preventDefault();
            el.setPointerCapture(event.pointerId);

            const direction = el.dataset.dir;
            const startBounds = await window.api.getBounds();
            const startX = event.screenX;
            const startY = event.screenY;

            const onMove = (moveEvent) => {
                const dx = moveEvent.screenX - startX;
                const dy = moveEvent.screenY - startY;
                let { x, y, width, height } = startBounds;

                if (direction.includes('e')) width = Math.max(MIN_WIDTH, startBounds.width + dx);
                if (direction.includes('s')) height = Math.max(MIN_HEIGHT, startBounds.height + dy);
                if (direction.includes('w')) {
                    width = Math.max(MIN_WIDTH, startBounds.width - dx);
                    x = startBounds.x + startBounds.width - width;
                }
                if (direction.includes('n')) {
                    height = Math.max(MIN_HEIGHT, startBounds.height - dy);
                    y = startBounds.y + startBounds.height - height;
                }

                window.api.setBounds({ x, y, width, height });
            };

            const onUp = () => {
                el.removeEventListener('pointermove', onMove);
                el.removeEventListener('pointerup', onUp);
            };

            el.addEventListener('pointermove', onMove);
            el.addEventListener('pointerup', onUp);
        });
    });
}

export { init };