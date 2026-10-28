export const THEMES = {
    beetroot: {
        name: 'Beetroot',
        swatch: '#2c0812',
        term: {
            background: 'rgba(0,0,0,0)',
            foreground: '#f0e6ea',
            cursor: '#ff6b70',
            cursorAccent: '#000000',
            selectionBackground: 'rgba(229,72,77,0.35)',
            black: '#1a0a10', brightBlack: '#5c3a45',
            red: '#e5484d', brightRed: '#ff6b70',
            green: '#2fa52f', brightGreen: '#6bd10a',
            yellow: '#d9a62e', brightYellow: '#f5d76e',
            blue: '#6a7fc4', brightBlue: '#7b93d6',
            magenta: '#a463c9', brightMagenta: '#c58af0',
            cyan: '#3aa5c9', brightCyan: '#6ad6e8',
            white: '#dcd0d5', brightWhite: '#ffffff'
        },
        css: {
            '--win-bg': 'rgba(24, 8, 14, .97)',
            '--frame-bg': 'rgba(28, 10, 18, .95)',
            '--frame-line': 'rgba(255, 120, 130, .08)',
            '--title': '#ff8c90',
            '--scroll': '#c23a44',
            '--term-bg-1': 'rgba(60, 10, 20, .65)',
            '--term-bg-2': 'rgba(10, 3, 6, .55)',
            '--term-bg-3': 'rgba(12, 4, 8, .55)',
            '--term-bg-4': 'rgba(16, 5, 10, .55)'
        }
    },
    matrix: {
        name: 'Matrix',
        swatch: '#0d2b12',
        term: {
            background: 'rgba(0,0,0,0)',
            foreground: '#a8ffb0',
            cursor: '#6bff7a',
            cursorAccent: '#000000',
            selectionBackground: 'rgba(107,255,122,0.3)',
            black: '#0a1a0d', brightBlack: '#2f5c38',
            red: '#ff5555', brightRed: '#ff7777',
            green: '#4dff66', brightGreen: '#9bffa8',
            yellow: '#d9ff6a', brightYellow: '#ecff9e',
            blue: '#5aa8ff', brightBlue: '#8cc4ff',
            magenta: '#b98cff', brightMagenta: '#d4b3ff',
            cyan: '#5affd9', brightCyan: '#96ffe8',
            white: '#cfdccf', brightWhite: '#ffffff'
        },
        css: {
            '--win-bg': 'rgba(8, 20, 11, .97)',
            '--frame-bg': 'rgba(10, 26, 13, .95)',
            '--frame-line': 'rgba(120, 255, 140, .08)',
            '--title': '#6bff7a',
            '--scroll': '#3fbf55',
            '--term-bg-1': 'rgba(10, 40, 16, .55)',
            '--term-bg-2': 'rgba(2, 8, 3, .55)',
            '--term-bg-3': 'rgba(3, 10, 4, .55)',
            '--term-bg-4': 'rgba(5, 14, 6, .55)'
        }
    },
    ocean: {
        name: 'Ocean',
        swatch: '#0a2a3a',
        term: {
            background: 'rgba(0,0,0,0)',
            foreground: '#d8ecf7',
            cursor: '#7fdcff',
            cursorAccent: '#000000',
            selectionBackground: 'rgba(127,220,255,0.3)',
            black: '#0a1a24', brightBlack: '#3b5c6e',
            red: '#ff6b7a', brightRed: '#ff8c99',
            green: '#4dd99b', brightGreen: '#7cf0bc',
            yellow: '#f0c060', brightYellow: '#ffd988',
            blue: '#4fa8e8', brightBlue: '#7fc4f5',
            magenta: '#c084e8', brightMagenta: '#dcb0f5',
            cyan: '#4de0e8', brightCyan: '#8cf0f5',
            white: '#cfe4ee', brightWhite: '#ffffff'
        },
        css: {
            '--win-bg': 'rgba(10, 30, 44, .97)',
            '--frame-bg': 'rgba(12, 36, 52, .95)',
            '--frame-line': 'rgba(140, 210, 255, .08)',
            '--title': '#7fdcff',
            '--scroll': '#3f8fc0',
            '--term-bg-1': 'rgba(14, 60, 90, .55)',
            '--term-bg-2': 'rgba(3, 10, 16, .55)',
            '--term-bg-3': 'rgba(4, 13, 20, .55)',
            '--term-bg-4': 'rgba(6, 18, 27, .55)'
        }
    },
    amethyst: {
        name: 'Amethyst',
        swatch: '#2a0f3d',
        term: {
            background: 'rgba(0,0,0,0)',
            foreground: '#ece0f7',
            cursor: '#d8a8ff',
            cursorAccent: '#000000',
            selectionBackground: 'rgba(216,168,255,0.3)',
            black: '#1f0f30', brightBlack: '#5a4a70',
            red: '#ff6b9d', brightRed: '#ff8cb3',
            green: '#7be39b', brightGreen: '#a8f0be',
            yellow: '#ffd47a', brightYellow: '#ffe4a8',
            blue: '#8f7dff', brightBlue: '#b3a8ff',
            magenta: '#e07cff', brightMagenta: '#eeaaff',
            cyan: '#7ce8e0', brightCyan: '#a8f5f0',
            white: '#dcd0ec', brightWhite: '#ffffff'
        },
        css: {
            '--win-bg': 'rgba(30, 14, 48, .97)',
            '--frame-bg': 'rgba(38, 18, 60, .95)',
            '--frame-line': 'rgba(200, 160, 255, .08)',
            '--title': '#d8a8ff',
            '--scroll': '#7a3fb0',
            '--term-bg-1': 'rgba(60, 20, 90, .55)',
            '--term-bg-2': 'rgba(8, 4, 14, .55)',
            '--term-bg-3': 'rgba(10, 5, 18, .55)',
            '--term-bg-4': 'rgba(14, 7, 24, .55)'
        }
    },
    mono: {
        name: 'Mono',
        swatch: '#1a1a1a',
        term: {
            background: 'rgba(0,0,0,0)',
            foreground: '#e0e0e0',
            cursor: '#ffffff',
            cursorAccent: '#000000',
            selectionBackground: 'rgba(255,255,255,0.25)',
            black: '#151515', brightBlack: '#606060',
            red: '#d65a5a', brightRed: '#ff7a7a',
            green: '#5ad65a', brightGreen: '#7aff7a',
            yellow: '#d6c05a', brightYellow: '#ffe07a',
            blue: '#5a8ad6', brightBlue: '#7ab0ff',
            magenta: '#b85ad6', brightMagenta: '#dc7aff',
            cyan: '#5ad6c0', brightCyan: '#7affe0',
            white: '#d0d0d0', brightWhite: '#ffffff'
        },
        css: {
            '--win-bg': 'rgba(26, 26, 26, .97)',
            '--frame-bg': 'rgba(32, 32, 32, .95)',
            '--frame-line': 'rgba(255, 255, 255, .07)',
            '--title': '#c0c0c0',
            '--scroll': '#606060',
            '--term-bg-1': 'rgba(40, 40, 40, .55)',
            '--term-bg-2': 'rgba(6, 6, 6, .55)',
            '--term-bg-3': 'rgba(9, 9, 9, .55)',
            '--term-bg-4': 'rgba(12, 12, 12, .55)'
        }
    }
};