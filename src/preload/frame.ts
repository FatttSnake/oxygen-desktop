import { contextBridge, ipcRenderer, Notification } from 'electron'

const IpcEvents = {
    window: {
        theme: {
            get: 'window:theme:get',
            update: 'window:theme:update'
        },
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
    },
    sidebar: {
        collapse: {
            get: 'sidebar:collapse:get',
            update: 'sidebar:collapse:update'
        }
    }
}

const oxygenApi = {
    platform: process.platform,
    renderer: 'frame',

    window: {
        theme: {
            get: (): Promise<WindowTheme> => ipcRenderer.invoke(IpcEvents.window.theme.get),
            onUpdate: (callback: (theme: WindowTheme) => void) =>
                ipcRenderer.on(IpcEvents.window.theme.update, (_, theme: WindowTheme) =>
                    callback(theme)
                ),
            update: (theme: WindowTheme) => ipcRenderer.send(IpcEvents.window.theme.update, theme)
        },
        titleBarOverlay: {
            setColor: (color: string, symbolColor: string) =>
                ipcRenderer.send(IpcEvents.window.titleBarOverlay.setColor, color, symbolColor)
        },
        tab: {
            create: (url: string) =>
                ipcRenderer.send(IpcEvents.window.tab.create, 'tool' as TabType, { url }),
            list: (): Promise<Tab[]> => ipcRenderer.invoke(IpcEvents.window.tab.list),
            onUpdate: (callback: (tabs: Tab[]) => void) =>
                ipcRenderer.on(IpcEvents.window.tab.update, (_, tabs: Tab[]) => callback(tabs)),
            update: (tabs: Tab[]) => ipcRenderer.send(IpcEvents.window.tab.update, tabs),
            onSwitch: (callback: (key: string) => void) =>
                ipcRenderer.on(IpcEvents.window.tab.switch, (_, key: string) => callback(key)),
            switch: (key: string): Promise<boolean> =>
                ipcRenderer.invoke(IpcEvents.window.tab.switch, key),
            close: (key: string) => ipcRenderer.send(IpcEvents.window.tab.close, key),
            independent: (key: string) => ipcRenderer.send(IpcEvents.window.tab.independent, key)
        }
    },
    sidebar: {
        collapse: {
            get: (): Promise<boolean> => ipcRenderer.invoke(IpcEvents.sidebar.collapse.get),
            update: (value: boolean) => ipcRenderer.send(IpcEvents.sidebar.collapse.update, value)
        }
    }
}

if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('Notify', Notification)
        contextBridge.exposeInMainWorld('oxygenApi', oxygenApi)
    } catch (error) {
        console.error(error)
    }
}
