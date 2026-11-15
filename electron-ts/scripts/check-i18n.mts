#!/usr/bin/env node
// Fails when Korean text appears outside the Korean message dictionary, so every
// user-facing string goes through the i18n dictionaries.
//
// - TS sources under src/: string and template literals only (comments are ignored).
//   A line containing `i18n-ignore` is skipped.
// - index.html: text and attributes, except elements marked with data-i18n /
//   data-i18n-placeholder, whose Korean must equal the dictionary value.
//
// Usage: node scripts/check-i18n.mts [--fix]
//   --fix  rewrite data-i18n text in index.html to match the dictionary
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import ts from 'typescript'

const root = join(import.meta.dirname, '..')
const srcDir = join(root, 'src')
const dictFile = join(srcDir, 'renderer/src/messages.ko.ts')
const htmlFile = join(srcDir, 'renderer/index.html')
const fix = process.argv.includes('--fix')

const hangul = /[ᄀ-ᇿ㄰-㆏가-힯]/
const errors: string[] = []

function report(file: string, text: string, index: number, message: string): void {
  const line = text.slice(0, index).split('\n').length
  errors.push(`${relative(root, file)}:${line}: ${message}`)
}

function loadDictionary(): Map<string, string> {
  const source = ts.createSourceFile(
    dictFile,
    readFileSync(dictFile, 'utf8'),
    ts.ScriptTarget.Latest
  )
  const entries = new Map<string, string>()
  const visit = (node: ts.Node): void => {
    if (ts.isPropertyAssignment(node) && ts.isStringLiteralLike(node.initializer)) {
      entries.set(node.name.getText(source), node.initializer.text)
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return entries
}

function listSources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return listSources(path)
    return /\.m?ts$/.test(entry.name) && !entry.name.endsWith('.d.ts') ? [path] : []
  })
}

function checkSource(file: string): void {
  const text = readFileSync(file, 'utf8')
  const lines = text.split('\n')
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true)
  const visit = (node: ts.Node): void => {
    const isLiteral =
      ts.isStringLiteralLike(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node)
    if (isLiteral && hangul.test(node.getText(source))) {
      const start = node.getStart(source)
      const line = source.getLineAndCharacterOfPosition(start).line
      if (!lines[line].includes('i18n-ignore')) {
        report(file, text, start, `Korean text outside the dictionary: ${node.getText(source)}`)
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
}

function checkHtml(dict: Map<string, string>): void {
  const original = readFileSync(htmlFile, 'utf8')
  let html = original.replace(/<!--[\s\S]*?-->/g, (comment) => comment.replace(/[^\n]/g, ' '))
  let fixed = original

  const lookup = (key: string, index: number): string | undefined => {
    const value = dict.get(key)
    if (value === undefined) report(htmlFile, html, index, `Unknown message key: ${key}`)
    return value
  }

  // <tag ... data-i18n="KEY" ...>text</tag>
  html = html.replace(
    /(<(\w+)\b[^>]*\bdata-i18n="(\w+)"[^>]*>)([^<]*)(<\/\2>)/g,
    (match, open: string, _tag, key: string, inner: string, close: string, index: number) => {
      const expected = lookup(key, index)
      if (expected !== undefined && inner.trim() !== expected) {
        if (fix) fixed = fixed.replace(match, `${open}${expected}${close}`)
        else
          report(
            htmlFile,
            html,
            index,
            `${key}: "${inner.trim()}" does not match the dictionary "${expected}"`
          )
      }
      return open.replace(/./g, ' ') + inner.replace(/[^\n]/g, ' ') + close
    }
  )

  // <tag ... data-i18n-placeholder="KEY" ... placeholder="text" ...>
  html = html.replace(
    /<[^>]*\bdata-i18n-placeholder="(\w+)"[^>]*>/g,
    (tag, key: string, index: number) => {
      const expected = lookup(key, index)
      const current = /(?<![\w-])placeholder="([^"]*)"/.exec(tag)?.[1]
      if (expected !== undefined && current !== expected) {
        if (fix)
          fixed = fixed.replace(
            tag,
            tag.replace(/(?<![\w-])placeholder="[^"]*"/, `placeholder="${expected}"`)
          )
        else
          report(
            htmlFile,
            html,
            index,
            `${key}: placeholder "${current}" does not match the dictionary "${expected}"`
          )
      }
      return tag.replace(/[^\n]/g, ' ')
    }
  )

  const match = hangul.exec(html)
  if (match) report(htmlFile, html, match.index, 'Korean text outside data-i18n elements')

  if (fix && fixed !== original) {
    writeFileSync(htmlFile, fixed)
    console.log(`check-i18n: updated ${relative(root, htmlFile)}`)
  }
}

const dict = loadDictionary()
for (const file of listSources(srcDir)) {
  if (file !== dictFile) checkSource(file)
}
checkHtml(dict)

if (errors.length > 0) {
  console.error(errors.join('\n'))
  console.error(
    `check-i18n: ${errors.length} problem(s)${fix ? '' : '; run with --fix to sync index.html'}`
  )
  process.exit(1)
}
console.log('check-i18n: ok')
