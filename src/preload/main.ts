import { contextBridge, Notification, ipcRenderer } from 'electron'

// Custom APIs for renderer
const oxygenApi = {
    platform: process.platform,
    renderer: 'main',

    onOpenUrl: (callback: (url: string) => void) =>
        ipcRenderer.on('mainView:url:open', (_, url: string) => callback(url))
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('Notify', Notification)
        contextBridge.exposeInMainWorld('oxygenApi', oxygenApi)
    } catch (error) {
        console.error(error)
    }
}
