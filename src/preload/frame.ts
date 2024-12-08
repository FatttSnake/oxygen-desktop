import { contextBridge, ipcRenderer, Notification } from 'electron'

const oxygenApi = {
    platform: process.platform,
    renderer: 'frame',

    updateTitleBar: (color: string, symbolColor: string) =>
        ipcRenderer.send('window:titleBarOverlay:setColor', color, symbolColor)
}

if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('Notify', Notification)
        contextBridge.exposeInMainWorld('oxygenApi', oxygenApi)
    } catch (error) {
        console.error(error)
    }
}
