# Beetroot Terminal

A production-grade, frameless terminal emulator for Windows. This repository contains a modular Electron application with a real PTY-backed shell, a custom titlebar, a theme engine, and an integrated clipboard panel. The architecture separates the main process, preload bridge, and renderer into independent modules.

The current release implements a verifiable terminal flow:

```text
xterm.js renderer -> window.api -> Electron IPC -> node-pty (ConPTY) -> shell
```

The application spawns a native shell via `node-pty` (ConPTY on Windows), renders it with xterm.js, and exposes system capabilities only through a typed `contextBridge` API. Themes are applied via CSS custom properties and xterm palettes. Clipboard entries can be pinned and persisted in `localStorage`, with one-click insertion into the terminal. A line-mode fallback activates automatically when ConPTY is unavailable or produces no output.

## Architecture

```text
src/main        Electron main process: window lifecycle, PTY, clipboard, IPC
src/preload     contextBridge API exposed to the renderer
src/renderer    UI modules: terminal, themes, panels, clipboard, resize
src/assets      HTML entry point, icon, and CSS stylesheets
```

## Prerequisites

- Node.js 18+
- Windows 10/11
- Optional: Visual Studio Build Tools with "Desktop development with C++" and Python 3, required only to rebuild `node-pty` from source

## Setup

```bash
npm install
```

`postinstall` runs `electron-rebuild -f -w node-pty` to match `node-pty` to the Electron ABI. If the rebuild fails because Visual Studio is missing, either install the VS Build Tools or skip the rebuild when `node-pty` is already matched:

```json
"build": {
  "npmRebuild": false
}
```

## Run

```bash
npm start
```

## Build

```bash
npm run dist
```

Artifacts are written to `dist/`:

```text
Beetroot Setup <version>.exe    NSIS installer
win-unpacked/Beetroot.exe       portable build
```

To build only the portable target, extend the Windows configuration:

```json
"win": {
  "target": [
    { "target": "nsis", "arch": ["x64"] },
    { "target": "portable", "arch": ["x64"] }
  ],
  "icon": "src/assets/icon.ico"
}
```

## Configuration

Environment variables:

| Variable | Effect |
| --- | --- |
| `WT_SHELL` | Overrides the shell executable (default `cmd.exe` on Windows, `bash` on Linux) |
| `WT_PLAIN` | Disables the custom `PROMPT` override for `cmd.exe` |
| `WT_FORCE_FALLBACK` | Skips `node-pty` and uses line-mode input |

The active theme is stored in `localStorage` under `bt_theme`. Pinned clipboard entries are stored under `bt_clipboard_pinned`.

## Icon

`src/assets/icon.ico` must be a multi-size ICO containing at least a 256×256 entry. Generate it from a square PNG (≥512×512) with ImageMagick:

```bash
magick icon.png -define icon:auto-resize=256,128,64,48,32,16 src/assets/icon.ico
```

or with Python + Pillow:

```bash
py -c "from PIL import Image; Image.open('icon.png').convert('RGBA').save('src/assets/icon.ico', sizes=[(256,256),(128,128),(64,64),(48,48),(32,32),(16,16)])"
```

## Commands

```bash
npm start
npm run rebuild
npm run dist
```

## Linux Notes

The application targets Windows primarily. On Linux:

- `bash` is used as the shell automatically.
- `frame: false` with `transparent: true` works on X11; Wayland limits window transparency and programmatic bounds changes.
- Provide `src/assets/icon.png` and add a `linux` section in `build` when packaging with `electron-builder --linux`.

## Known Limitations

- The Windows build uses ConPTY; older Windows versions may fall back to line-mode input.
- Node-pty must be rebuilt for the Electron ABI; `npmRebuild: false` skips this and relies on an already-matched binary.
- Pinned clipboard entries are stored locally and never synchronized across devices.
- Themes modify only CSS variables and xterm palettes; ANSI colors emitted by the shell still follow the theme's palette.