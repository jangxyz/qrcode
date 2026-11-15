import { en } from './messages.en'
import { ko, type MessageKey } from './messages.ko'

// main passes ?lang= (from --lang or the system locale); navigator.language is only a fallback.
const requested = new URLSearchParams(location.search).get('lang') ?? navigator.language
const lang = requested.toLowerCase().startsWith('ko') ? 'ko' : 'en'
const messages: Record<MessageKey, string> = lang === 'ko' ? ko : en

export function t(key: MessageKey, params: Record<string, string> = {}): string {
  return messages[key].replace(/\{(\w+)\}/g, (match, name: string) => params[name] ?? match)
}

export function setText(el: HTMLElement, key: MessageKey, params?: Record<string, string>): void {
  el.textContent = t(key, params)
}

// Fills elements marked with data-i18n / data-i18n-placeholder in index.html.
export function applyStaticText(): void {
  document.documentElement.lang = lang
  for (const el of document.querySelectorAll<HTMLElement>('[data-i18n]')) {
    setText(el, el.dataset.i18n as MessageKey)
  }
  for (const el of document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
    '[data-i18n-placeholder]'
  )) {
    el.placeholder = t(el.dataset.i18nPlaceholder as MessageKey)
  }
}
