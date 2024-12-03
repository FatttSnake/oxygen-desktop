import { contextBridge, Notification, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
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
        contextBridge.exposeInMainWorld('electronAPI', electronAPI)
        contextBridge.exposeInMainWorld('api', api)
        contextBridge.exposeInMainWorld('Notification', Notification)
    } catch (error) {
        console.error(error)
    }
}
