import { join } from 'path'
import { randomUUID } from 'node:crypto'
import { BrowserWindow, ipcMain, shell, WebContentsView } from 'electron'
import { is } from '@electron-toolkit/utils'
import { IpcEvents } from './constants'
import { getWindowBounds } from './dataStore/main'
import { addTab, removeTab, switchTab, updateTab } from './common'

export const processBoundsUpdate = (mainWindow: BrowserWindow, view: WebContentsView) => {
    ipcMain.on(IpcEvents.menuView.width.update, (_, menuWidth: number) => {
        const { width, height } = mainWindow.getBounds()
        view.setBounds({
            x: menuWidth,
            y: 41,
            width: width - menuWidth,
            height: height - 41
        })
    })
}

export const processIpcEvents = (mainWindow: BrowserWindow, menuView: WebContentsView) => {
    ipcMain.on(
        IpcEvents.window.titleBarOverlay.setColor,
        (_, color: string, symbolColor: string) => {
            if (['win32', 'linux'].includes(process.platform)) {
                mainWindow.setTitleBarOverlay({ color, symbolColor, height: 40 })
            }
        }
    )

    ipcMain.on(IpcEvents.menuView.width.update, (_, menuWidth: number) => {
        global.sharedObject.menuWidth = menuWidth
        const { width, height } = mainWindow.getBounds()
        menuView.setBounds({
            x: 0,
            y: 41,
            width: width,
            height: height - 41
        })
    })

    ipcMain.on(IpcEvents.window.tab.create, (_, url: string) => {
        const viewId = randomUUID()
        const newView = new WebContentsView({
            webPreferences: {
                preload: join(__dirname, '../preload/tool.js'),
                additionalArguments: [`--view-id=${viewId}`, `--url=${url}`]
            }
        })

        const { width, height } = getWindowBounds()
        newView.setBounds({
            x: global.sharedObject.menuWidth,
            y: 41,
            width: width - global.sharedObject.menuWidth,
            height: height - 41
        })
        newView.setVisible(false)

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

        processBoundsUpdate(mainWindow, newView)
        addTab(mainWindow, newView, viewId, viewId)
        mainWindow.contentView.addChildView(newView)
        switchTab(mainWindow, viewId)
    })

    ipcMain.handle(IpcEvents.window.tab.list, () =>
        (global.sharedObject as SharedObject).mainWindowViews.map(
            ({ key, title, pin }) =>
                ({
                    key,
                    title,
                    pin
                }) as Tab
        )
    )

    ipcMain.on(IpcEvents.window.tab.update, (_, tabs: Tab[]) => {
        updateTab(mainWindow, tabs)
    })

    ipcMain.on(IpcEvents.window.tab.switch, (_, key: string) => {
        switchTab(mainWindow, key)
    })

    ipcMain.on(IpcEvents.window.tab.close, (_, key: string) => {
        removeTab(mainWindow, key)
    })

    ipcMain.on(IpcEvents.window.tab.independent, (_, key: string) => {
        console.warn('Not Supported', key)
    })
}
