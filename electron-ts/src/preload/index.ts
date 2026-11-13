import { contextBridge, ipcRenderer } from 'electron'

// Custom APIs for renderer
const api = {
  qrSvg: (text: string): Promise<string> => ipcRenderer.invoke('qr:svg', text),
  saveQr: (text: string, format: 'svg' | 'png'): Promise<string | null> =>
    ipcRenderer.invoke('qr:save', text, format)
}

export type Api = typeof api

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.api = api
}
