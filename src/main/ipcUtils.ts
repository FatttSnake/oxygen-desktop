import { join } from 'path'
import { randomUUID } from 'node:crypto'
import { BrowserWindow, ipcMain, shell, WebContentsView, nativeTheme } from 'electron'
import { is } from '@electron-toolkit/utils'
import { IpcEvents } from './constants'
import { settings } from './dataStore'
import { addTab, getGlobalObject, removeTab, switchTab, updateTab } from './common'

export const processIpcEvents = (mainWindow: BrowserWindow) => {
    ipcMain.handle(IpcEvents.window.theme.get, () => settings.window.getTheme())

    ipcMain.on(IpcEvents.window.theme.update, (_, theme: WindowTheme) => {
        settings.window.saveTheme(theme)
        mainWindow.webContents.send(IpcEvents.window.theme.update, theme)
        getGlobalObject().mainWindowViews.forEach((item) => {
            item.view.webContents.send(IpcEvents.window.theme.update, theme)
        })

        switch (theme) {
            case 'FOLLOW_SYSTEM':
                nativeTheme.themeSource = 'system'
                break
            case 'LIGHT':
                nativeTheme.themeSource = 'light'
                break
            case 'DARK':
                nativeTheme.themeSource = 'dark'
        }
    })

    ipcMain.on(
        IpcEvents.window.titleBarOverlay.setColor,
        (_, color: string, symbolColor: string) => {
            if (['win32', 'linux'].includes(process.platform)) {
                mainWindow.setTitleBarOverlay({ color, symbolColor, height: 40 })
            }
        }
    )

    ipcMain.handle(IpcEvents.sidebar.collapse.get, () => settings.sidebar.getIsCollapsed())

    ipcMain.on(IpcEvents.sidebar.collapse.update, (_, value: boolean) => {
        settings.sidebar.saveIsCollapsed(value)
        mainWindow.webContents.send(IpcEvents.sidebar.collapse.update, value)
        getGlobalObject().mainWindowViews.forEach((item) => {
            if (item.pin) {
                item.view.webContents.send(IpcEvents.sidebar.collapse.update, value)
            }
        })
    })

    ipcMain.on(IpcEvents.sidebar.width.update, (_, menuWidth: number) => {
        getGlobalObject().menuWidth = menuWidth
        const { width, height } = mainWindow.getContentBounds()
        getGlobalObject().mainWindowViews.forEach(({ view, pin }) => {
            if (pin) {
                return
            }
            view.setBounds({
                x: menuWidth,
                y: 40,
                width: width - menuWidth,
                height: height - 40
            })
        })
    })

    ipcMain.on(
        IpcEvents.window.tab.create,
        (_, type: TabType, args: Record<string, string | number | boolean>) => {
            const { viewId, preload, menuWidth } = ((): {
                viewId: string
                preload: string
                menuWidth: number
            } => {
                switch (type) {
                    case 'settings':
                        return { viewId: 'settings', preload: 'settings.js', menuWidth: 0 }
                    default:
                        return {
                            viewId: randomUUID(),
                            preload: 'tool.js',
                            menuWidth: getGlobalObject().menuWidth
                        }
                }
            })()
            const argStr = Object.entries(args).map(
                ([key, value]) => `--${key}=${encodeURIComponent(value)}`
            )
            const newView = new WebContentsView({
                webPreferences: {
                    preload: join(__dirname, `../preload/${preload}`),
                    additionalArguments: [`--view-id=${viewId}`, ...argStr]
                }
            })

            const { width, height } = mainWindow.getContentBounds()
            newView.setBounds({
                x: menuWidth,
                y: 40,
                width: width - menuWidth,
                height: height - 40
            })
            newView.setVisible(false)
            newView.setBackgroundColor('rgba(0, 0, 0, 0)')

            newView.webContents.setWindowOpenHandler((details) => {
                void shell.openExternal(details.url)
                return { action: 'deny' }
            })

            newView.webContents.on('did-finish-load', () => {
                mainWindow.show()
                if (is.dev) {
                    newView.webContents.openDevTools()
                }
            })

            // HMR for renderer base on electron-vite cli.
            // Load the remote URL for development or the local html file for production.
            if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
                void newView.webContents.loadURL(process.env['ELECTRON_RENDERER_URL'])
            } else {
                // void mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
                void newView.webContents.loadURL(
                    `local://oxygen.fatweb.top/${join(__dirname, '../renderer/index.html')}`
                )
            }

            addTab(mainWindow, newView, viewId, type, viewId)
            mainWindow.contentView.addChildView(newView)
            switchTab(mainWindow, viewId)
        }
    )

    ipcMain.handle(IpcEvents.window.tab.list, () =>
        getGlobalObject().mainWindowViews.map(
            ({ key, type, icon, title, pin, persistent }) =>
                ({
                    key,
                    type,
                    icon,
                    title,
                    pin,
                    persistent
                }) as Tab
        )
    )

    ipcMain.on(IpcEvents.window.tab.update, (_, tabs: Tab[]) => {
        updateTab(mainWindow, tabs)
    })

    ipcMain.handle(IpcEvents.window.tab.switch, (_, key: string) => {
        return switchTab(mainWindow, key)
    })

    ipcMain.on(IpcEvents.window.tab.close, (_, key: string) => {
        removeTab(mainWindow, key)
    })

    ipcMain.on(IpcEvents.window.tab.independent, (_, key: string) => {
        console.warn('Not Supported', key)
    })
}
