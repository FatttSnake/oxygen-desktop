import { contextBridge, Notification, ipcRenderer } from 'electron'

// Custom APIs for renderer
const baseApi = {
    updateTitleBar: (color: string, symbolColor: string) =>
        ipcRenderer.send('window:titleBarOverlay:color', color, symbolColor),
    getInstalledTool: () => ipcRenderer.invoke('store:getInstalledTool'),
    installTool: (newTools: Record<string, Record<Platform, ToolVo>>) =>
        ipcRenderer.invoke('store:installTool', newTools),
    uninstallTool: (key: string) => ipcRenderer.invoke('store:uninstallTool', key)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electronAPI', {
            onOpenUrl: (callback: (url: string) => void) => {
                ipcRenderer.on('open-url', (_, url: string) => callback(url))
            }
        })
        contextBridge.exposeInMainWorld('baseApi', baseApi)
        contextBridge.exposeInMainWorld('Notification', Notification)
    } catch (error) {
        console.error(error)
    }
}
