import { join } from 'path'
import { randomUUID } from 'node:crypto'
import { shell, WebContentsView } from 'electron'
import { kebabCase } from 'lodash'
import { is } from '@electron-toolkit/utils'
import { IpcEvents, WindowConstants } from '#/constants'
import windowManager from '#/app/windowManager'
import { svgToNativeImage } from '#/util/asset'

const getMainWindow = () => windowManager.getMainWindow()
const getMainWindowViews = () => getMainWindow()?.listViews()
const handleUpdateTabs = () => {
    windowManager.getMainWindow()?.window.webContents.send(
        IpcEvents.window.tab.update,
        getMainWindowViews()?.map(
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
}
const addTab = (
    view: WebContentsView,
    viewId: string,
    type: TabType,
    padding: number,
    title: string = '',
    pin: boolean,
    persistent: boolean,
    renderTool: boolean
) => {
    !renderTool &&
        view.webContents.on('page-title-updated', (_, title) => {
            getMainWindow()?.forEachViews((item) => {
                if (item.key === viewId) {
                    item.title = title
                    handleUpdateTabs()
                }
            })
        })
    !renderTool &&
        view.webContents.on('page-favicon-updated', (_, [icon]) => {
            if (icon.endsWith('favicon.ico')) {
                return
            }
            getMainWindow()?.forEachViews((item) => {
                if (item.key === viewId) {
                    item.icon = icon
                    handleUpdateTabs()
                }
            })
        })
    getMainWindow()?.addView({
        key: viewId,
        type,
        view,
        padding,
        title,
        pin,
        persistent
    })
    handleUpdateTabs()
}

const TabManager = {
    createTab: (type: TabType, args?: Record<string, string | number | boolean>) => {
        const mainWindow = getMainWindow()
        if (!mainWindow) {
            return
        }
        if (type === 'core' && getMainWindowViews()?.some(({ key }) => key === 'coreView')) {
            TabManager.switchTab('coreView')
            return
        }
        if (
            type === 'settings' &&
            getMainWindowViews()?.some(({ key }) => key === 'settingsView')
        ) {
            TabManager.switchTab('settingsView')
            args?.['navigateTo'] &&
                getMainWindowViews()
                    ?.find(({ key }) => key === 'settingsView')
                    ?.view.webContents.send(IpcEvents.window.navigate.goto, args['navigateTo'])
            return
        }
        if (type === 'sign' && getMainWindowViews()?.some(({ key }) => key === 'signView')) {
            TabManager.switchTab('signView')
            return
        }

        const {
            viewId,
            preload,
            padding = 0,
            menuWidth,
            title,
            pin = false,
            persistent = false,
            renderTool = false
        } = ((): {
            viewId: string
            preload: string
            padding?: number
            menuWidth: number
            title: string
            pin?: boolean
            persistent?: boolean
            renderTool?: boolean
        } => {
            switch (type) {
                case 'core':
                    return {
                        viewId: 'coreView',
                        preload: 'core.js',
                        menuWidth: 0,
                        title: 'Oxygen Toolbox',
                        pin: true,
                        persistent: true
                    }
                case 'settings':
                    return {
                        viewId: 'settingsView',
                        preload: 'settings.js',
                        menuWidth: 0,
                        title: 'Settings',
                        pin: true
                    }
                case 'sign':
                    return {
                        viewId: 'signView',
                        preload: 'sign.js',
                        menuWidth: 0,
                        title: 'Sign',
                        pin: true
                    }
                default: {
                    const viewId = randomUUID()
                    return {
                        viewId: viewId,
                        preload: 'tool.js',
                        padding: 20,
                        menuWidth: windowManager.menuWidth.get(),
                        title: '',
                        renderTool: true
                    }
                }
            }
        })()
        const argStr = args
            ? Object.entries(args).map(
                  ([key, value]) => `--${kebabCase(key)}=${encodeURIComponent(value)}`
              )
            : []
        const newView = new WebContentsView({
            webPreferences: {
                preload: join(__dirname, `../preload/${preload}`),
                additionalArguments: [`--view-id=${viewId}`, ...argStr]
            }
        })

        const { width, height } = mainWindow.window.getContentBounds()
        newView.setBounds({
            x: menuWidth + padding,
            y: WindowConstants.TITLE_BAR_HEIGHT + padding,
            width: width - menuWidth - padding * 2,
            height: height - WindowConstants.TITLE_BAR_HEIGHT - padding * 2
        })
        newView.setVisible(false)
        newView.setBackgroundColor('rgba(0, 0, 0, 0)')
        newView.webContents.setWindowOpenHandler((details) => {
            void shell.openExternal(details.url)
            return { action: 'deny' }
        })
        newView.webContents.on('did-finish-load', () => {
            if (is.dev) {
                newView.webContents.openDevTools()
            }
        })
        newView.webContents.on('destroyed', () => {
            mainWindow
                .getView('coreView')
                ?.view.webContents.send(IpcEvents.window.tab.closed, viewId)
            mainWindow
                .getView('settingsView')
                ?.view.webContents.send(IpcEvents.window.tab.closed, viewId)
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

        addTab(newView, viewId, type, padding, title, pin, persistent, renderTool)
        mainWindow.window.contentView.addChildView(newView)
        TabManager.switchTab(viewId)

        return viewId
    },
    listTab: () =>
        getMainWindowViews()?.map(
            ({ key, type, icon, title, pin, persistent }) =>
                ({
                    key,
                    type,
                    icon,
                    title,
                    pin,
                    persistent
                }) as Tab
        ) ?? [],
    updateTab: (tabs: Tab[]) => {
        const mainWindow = getMainWindow()
        if (!mainWindow) {
            return
        }

        mainWindow.listViews().forEach(({ key }) => {
            if (!tabs.some((tab) => tab.key === key)) {
                getMainWindow()?.closeView(key)
            }
        })
        mainWindow.sortViews(tabs.map((tab) => tab.key))
        handleUpdateTabs()
    },
    switchTab: (key: string): boolean => {
        if (windowManager.windows.exists(key)) {
            windowManager.windows.get(key)?.window.show()
            return true
        }
        if (!getMainWindowViews()?.some((item) => item.key === key)) {
            return false
        }

        getMainWindow()?.forEachViews((item) => {
            item.view.setVisible(item.key === key)
        })
        getMainWindow()?.window.webContents.send(IpcEvents.window.tab.switch, key)

        return true
    },
    removeTab: (key: string) => {
        getMainWindow()?.closeView(key)
        handleUpdateTabs()
    },
    independentTab: (key: string) => {
        const mainWindow = getMainWindow()
        const targetView = mainWindow?.getView(key)
        if (!mainWindow || !targetView) {
            return
        }

        targetView.view.setVisible(false)
        mainWindow.removeView(key)
        handleUpdateTabs()
        windowManager.createWindow(key, 'independent', targetView.icon, targetView.title)
        windowManager.windows.get(key)?.addView(targetView)
    },
    updateTabIcon: (key: string, icon: string) => {
        const window = windowManager.windows.get(key)
        if (window) {
            window.window.setIcon(svgToNativeImage(icon))
            window.window.webContents.send(IpcEvents.window.common.icon, icon)
            return
        }

        const view = getMainWindow()?.getView(key)
        if (!view) {
            return
        }
        view.icon = icon
        handleUpdateTabs()
    },
    updateTabTitle: (key: string, title: string) => {
        const window = windowManager.windows.get(key)
        if (window) {
            window.window.setTitle(title)
            window.window.webContents.send(IpcEvents.window.common.title, title)
            return
        }

        const view = getMainWindow()?.getView(key)
        if (!view) {
            return
        }
        view.title = title
        handleUpdateTabs()
    }
}

export default TabManager
