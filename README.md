# qrcode

English | [한국어](README.ko.md)

A tool that turns text or a URL into a QR code and saves it as SVG or PNG. Everything runs locally; no server is involved.

This repository builds the same tool with several tech stacks for comparison. Each implementation lives in its own directory and is built and run as an independent project.

| Directory | Stack | Provides |
| --- | --- | --- |
| [`electron-ts/`](electron-ts/) | Electron + TypeScript | Desktop app, `qr-gen` CLI |

## electron-ts

Requires Node 22.18 or later, because the CLI runs its TypeScript source directly with Node, without a build step.

```sh
cd electron-ts
npm install
```

### Desktop app

```sh
npm run dev
```

Type text into the input box and the QR code preview updates as you type. Save it with the "SVG로 저장" (Save as SVG) or "PNG로 저장" (Save as PNG) button. If the text is too long to fit in a QR code, a message says so.

### qr-gen CLI

```sh
npm run qr-gen -- "hello"                          # draw the QR code in the terminal
npm run qr-gen -- "https://example.com" -o a.svg   # save as SVG
echo -n "some text" | npm run qr-gen -- -o a.png   # read from stdin, save as PNG
```

Without `-o`, the QR code is drawn in the terminal and no file is written. With `-o`, the file extension (`.svg` or `.png`) decides the format.

To run `qr-gen` from any directory, run `npm link` once inside `electron-ts/`. It links to the project files, so code changes take effect immediately. To remove it, use the package name: `npm rm -g qr-gen`.

The GUI and the CLI share the same generator module (`src/main/qr.mts`), so the same input always produces the same QR code.
