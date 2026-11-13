import QRCode from 'qrcode'

export type QrFormat = 'svg' | 'png'

const options = { errorCorrectionLevel: 'M', margin: 4 } as const

export function toSvg(text: string): Promise<string> {
  return QRCode.toString(text, { ...options, type: 'svg' })
}

export function toPng(text: string): Promise<Buffer> {
  return QRCode.toBuffer(text, { ...options, type: 'png', scale: 10 })
}

export function toTerminal(text: string): Promise<string> {
  return QRCode.toString(text, { ...options, type: 'utf8' })
}
