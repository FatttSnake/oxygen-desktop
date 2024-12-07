import { contextBridge, Notification, ipcRenderer } from 'electron'

// Custom APIs for renderer
const oxygenApi = {
    updateTitleBar: (color: string, symbolColor: string) =>
        ipcRenderer.send('window:titleBarOverlay:setColor', color, symbolColor),

    onOpenUrl: (callback: (url: string) => void) => {
        ipcRenderer.on('mainView:url:open', (_, url: string) => callback(url))
    },

    changeToolViewVisible: (visible: boolean) => ipcRenderer.send('toolView:visible:set', visible),
    changeToolViewBounds: (x: number, y: number, width: number, height: number) =>
        ipcRenderer.send('toolView:bounds:set', x, y, width, height)
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
