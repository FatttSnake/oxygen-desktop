import { contextBridge, Notification, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
    installTool: (newTools: Record<string, Record<Platform, ToolVo>>) =>
        ipcRenderer.invoke('store:installTool', newTools),
    getInstalledTool: () => ipcRenderer.invoke('store:getInstalledTool')
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
} else {
    // @ts-expect-error (define in dts)
    window.electronAPI = electronAPI
    // @ts-expect-error (define in dts)
    window.api = api
    // @ts-expect-error (define in dts)
    window.Notification = Notification
}
