import { contextBridge, ipcRenderer, Notification } from 'electron'

const IpcEvents = {
    window: {
        titleBarOverlay: {
            setColor: 'window:titleBarOverlay:setColor'
        },

        tab: {
            create: 'window:tab:create',
            list: 'window:tab:list',
            update: 'window:tab:update',
            switch: 'window:tab:switch',
            close: 'window:tab:close',
            independent: 'window:tab:independent'
        }
    }
}

const oxygenApi = {
    platform: process.platform,
    renderer: 'frame',

    updateTitleBar: (color: string, symbolColor: string) =>
        ipcRenderer.send(IpcEvents.window.titleBarOverlay.setColor, color, symbolColor),

    createNewTab: (url: string) => ipcRenderer.send(IpcEvents.window.tab.create, url),

    listTabs: (): Promise<Tab[]> => ipcRenderer.invoke(IpcEvents.window.tab.list),

    onUpdateTab: (callback: (tabs: Tab[]) => void) =>
        ipcRenderer.on(IpcEvents.window.tab.update, (_, tabs: Tab[]) => callback(tabs)),

    updateTabs: (tabs: Tab[]) => ipcRenderer.send(IpcEvents.window.tab.update, tabs),

    onSwitchTab: (callback: (key: string) => void) =>
        ipcRenderer.on(IpcEvents.window.tab.switch, (_, key: string) => callback(key)),

    switchTab: (key: string) => ipcRenderer.send(IpcEvents.window.tab.switch, key),

    closeTab: (key: string) => ipcRenderer.send(IpcEvents.window.tab.close, key),

    independentTab: (key: string) => ipcRenderer.send(IpcEvents.window.tab.independent, key)
}

if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('Notify', Notification)
        contextBridge.exposeInMainWorld('oxygenApi', oxygenApi)
    } catch (error) {
        console.error(error)
    }
}
