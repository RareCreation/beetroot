import { hexToHsl, hsl } from './ColorSpaceConverter.js';

function derivePalette(baseHex) {
    if (!baseHex) return null;

    const [h, s, l] = hexToHsl(baseHex);
    const isAchromatic = s < 8;
    const chroma = isAchromatic ? 0 : Math.max(18, Math.min(60, s * 0.7));

    const winLightness = Math.max(4, Math.min(14, l * 0.22));
    const frameLightness = Math.max(6, Math.min(18, l * 0.30));
    const titleLightness = Math.max(58, Math.min(78, l + 28));
    const scrollLightness = Math.max(34, Math.min(52, l + 6));
    const termBackgroundLightness = Math.max(10, Math.min(26, l * 0.42));

    const hueShift = 8;
    const windowHue = (h + hueShift) % 360;
    const frameHue = (h - hueShift + 360) % 360;
    const titleHue = (h + hueShift / 2) % 360;
    const scrollHue = (h - hueShift / 2 + 360) % 360;

    return {
        win: hsl(windowHue, chroma * 0.55, winLightness, 0.97),
        frame: hsl(frameHue, chroma * 0.65, frameLightness, 0.95),
        line: hsl(titleHue, chroma, titleLightness, 0.08),
        title: hsl(titleHue, chroma, titleLightness),
        scroll: hsl(scrollHue, chroma, scrollLightness),
        t1: hsl(windowHue, chroma * 0.75, termBackgroundLightness, 0.65),
        t2: hsl(frameHue, chroma * 0.45, 3, 0.55),
        t3: hsl(windowHue, chroma * 0.45, 5, 0.55),
        t4: hsl(frameHue, chroma * 0.45, 8, 0.55)
    };
}

export { derivePalette };