function hexToHsl(hex) {
    let normalized = String(hex || '').replace('#', '');
    if (normalized.length === 3) {
        normalized = normalized.split('').map((c) => c + c).join('');
    }
    const numeric = parseInt(normalized, 16);
    if (Number.isNaN(numeric)) return [0, 0, 50];

    const r = ((numeric >> 16) & 255) / 255;
    const g = ((numeric >> 8) & 255) / 255;
    const b = (numeric & 255) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lightness = (max + min) / 2;

    let hue = 0;
    let saturation = 0;

    if (max !== min) {
        const delta = max - min;
        saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

        switch (max) {
            case r: hue = (g - b) / delta + (g < b ? 6 : 0); break;
            case g: hue = (b - r) / delta + 2; break;
            case b: hue = (r - g) / delta + 4; break;
        }
        hue /= 6;
    }

    return [hue * 360, saturation * 100, lightness * 100];
}

function hsl(h, s, l, a) {
    return a === undefined
        ? `hsl(${h}, ${s}%, ${l}%)`
        : `hsla(${h}, ${s}%, ${l}%, ${a})`;
}

export { hexToHsl, hsl };