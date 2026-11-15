# electron-ts

The Electron + TypeScript implementation of QR Generator: a desktop app and the `qr-gen` CLI. See the [top-level README](../README.md) for what the tool does and how to use it.

## Development

```sh
npm install
npm run dev          # run the desktop app with hot reload
npm run qr-gen -- "hello"   # run the CLI from source
```

```sh
npm run typecheck
npm run lint
```

## Build

```sh
npm run build:mac    # dist/: QR Generator.app, .dmg, .zip
```

`build:win` and `build:linux` are also defined but have not been tried.

## Layout

- `src/main/qr.mts` — QR generation, shared by the app and the CLI
- `src/main/index.ts` — Electron main process: window, IPC, save dialog
- `src/preload/` — the API exposed to the renderer
- `src/renderer/` — the app's UI
- `src/cli/qr-gen.mts` — the CLI entry point
- `build/icon.svg` — source of the app icon; the `.icns`, `.ico` and `.png` files are generated from it
