import { contextBridge, Notification, ipcRenderer } from 'electron'

const oxygenApi = {
    platform: process.platform,
    renderer: 'main',

    onOpenUrl: (callback: (url: string) => void) =>
        ipcRenderer.on('mainView:url:open', (_, url: string) => callback(url))
}

if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('Notify', Notification)
        contextBridge.exposeInMainWorld('oxygenApi', oxygenApi)
    } catch (error) {
        console.error(error)
    }
}
