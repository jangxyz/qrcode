#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import { extname } from 'node:path'
import { parseArgs } from 'node:util'
import { toPng, toSvg, toTerminal } from '../main/qr.mts'

const usage = `Usage: qr-gen [options] [text]

Print a QR code for <text> to the terminal, or save it with -o.
Reads text from stdin when <text> is omitted.

Options:
  -o, --output <file>  Save as SVG or PNG, chosen by the file extension
  -h, --help           Show this help`

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    output: { type: 'string', short: 'o' },
    help: { type: 'boolean', short: 'h' }
  }
})

if (values.help) {
  console.log(usage)
  process.exit(0)
}

const text = positionals.length > 0 ? positionals.join(' ') : readFileSync(0, 'utf8')
if (text === '') {
  console.error(usage)
  process.exit(1)
}

try {
  const output = values.output
  if (!output) {
    process.stdout.write(await toTerminal(text))
  } else {
    const format = extname(output).toLowerCase()
    if (format === '.svg') writeFileSync(output, await toSvg(text))
    else if (format === '.png') writeFileSync(output, await toPng(text))
    else throw new Error(`Unsupported file extension: ${format || '(none)'} (use .svg or .png)`)
  }
} catch (error) {
  console.error(`qr-gen: ${(error as Error).message}`)
  process.exit(1)
}
