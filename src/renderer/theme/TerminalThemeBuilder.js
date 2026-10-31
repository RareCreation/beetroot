import { hexToHsl, hsl } from './ColorSpaceConverter.js';
import { derivePalette } from './PaletteDeriver.js';

function buildTerminalTheme(baseHex) {
    const palette = derivePalette(baseHex);
    if (!palette) return null;

    const [h, s] = hexToHsl(baseHex);
    const isAchromatic = s < 8;
    const saturation = isAchromatic ? 0 : Math.max(30, Math.min(70, s));

    return {
        background: 'rgba(0,0,0,0)',
        foreground: hsl(h, Math.min(12, saturation), 92),
        cursor: palette.title,
        cursorAccent: '#000000',
        selectionBackground: hsl(h, saturation, 60, 0.35),
        black: hsl(h, saturation * 0.5, 8),
        brightBlack: hsl(h, saturation * 0.5, 38),
        red: hsl(h, saturation, 62),
        brightRed: hsl(h, saturation, 74),
        green: hsl((h + 120) % 360, saturation, 58),
        brightGreen: hsl((h + 120) % 360, saturation, 72),
        yellow: hsl((h + 50) % 360, saturation, 62),
        brightYellow: hsl((h + 50) % 360, saturation, 76),
        blue: hsl((h + 210) % 360, saturation, 65),
        brightBlue: hsl((h + 210) % 360, saturation, 76),
        magenta: hsl((h + 285) % 360, saturation, 65),
        brightMagenta: hsl((h + 285) % 360, saturation, 76),
        cyan: hsl((h + 170) % 360, saturation, 62),
        brightCyan: hsl((h + 170) % 360, saturation, 74),
        white: hsl(h, Math.min(10, saturation), 82),
        brightWhite: '#ffffff'
    };
}

export { buildTerminalTheme };