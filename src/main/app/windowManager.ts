import { join } from 'path'
import { BrowserWindow, nativeTheme, shell, WebContents, WebContentsView } from 'electron'
import { is } from '@electron-toolkit/utils'
import appIcon from '^/build/icon.ico?asset'
import { settings } from '#/dataStore'
import { WindowConstants } from '#/constants'
import { svgToNativeImage } from '#/util/asset'
import { randomUUID } from 'node:crypto'

const getGlobalObject = (): SharedObject => global.sharedObject
const setGlobalObject = (newGlobalObject: SharedObject) => (global.sharedObject = newGlobalObject)

setGlobalObject({
    menuWidth: 0,
    windows: []
})

export class WindowInfo {
    readonly key: string
    readonly type: WindowType
    readonly window: BrowserWindow
    private views: ViewInfo[] = []

    constructor(key: string, type: WindowType = 'independent', window: BrowserWindow) {
        this.key = key
        this.type = type
        this.window = window
    }

    public listViews = () => this.views
    public forEachViews = (callback: (value: ViewInfo) => void) =>
        this.listViews().forEach(callback)
    public forEachWebContents = (
        callback: (value: WebContents) => void,
        filter?: (viewInfo: ViewInfo) => boolean
    ) => {
        callback(this.window.webContents)
        this.views
            .filter(filter ?? (() => true))
            .map((viewInfo) => viewInfo.view.webContents)
            .forEach(callback)
    }
    public forEachPinWebContents = (callback: (value: WebContents) => void) => {
        this.forEachWebContents(callback, (viewInfo) => viewInfo.pin === true)
    }
    public getView = (key: string) => this.listViews().find((view) => view.key === key)
    private setViews = (views: ViewInfo[]) => {
        this.views = views
    }
    public addView = (viewInfo: ViewInfo) => {
        this.window.contentView.addChildView(viewInfo.view)
        this.listViews().push(viewInfo)
    }
    public existsView = (key: string) => this.listViews().some((view) => view.key === key)
    public sortViews = (keys: string[]) => {
        this.setViews(
            this.listViews().sort((a, b) => {
                const indexA = keys.indexOf(a.key)
                const indexB = keys.indexOf(b.key)
                return indexA - indexB
            })
        )
    }
    public clearViews = () => {
        this.forEachViews(({ key }) => {
            this.closeView(key)
        })
    }
    public closeView = (key: string) => {
        if (!this.existsView(key)) {
            return false
        }

        this.getView(key)?.view.webContents.close()
        return this.removeView(key)
    }
    public removeView = (key: string) => {
        if (!this.existsView(key)) {
            return false
        }

        this.setViews(
            this.listViews().filter((viewInfo) => {
                if (viewInfo.key === key) {
                    this.window.contentView.removeChildView(viewInfo.view)
                }
                return viewInfo.key !== key
            })
        )

        return true
    }
}

const WindowManager = {
    menuWidth: {
        get: () => getGlobalObject().menuWidth,
        set: (menuWidth: number) => (getGlobalObject().menuWidth = menuWidth)
    },

    windows: {
        list: (): WindowInfo[] => getGlobalObject().windows,
        forEach: (callback: (windowInfo: WindowInfo) => void) =>
            WindowManager.windows.list().forEach(callback),
        get: (key: string): WindowInfo | undefined =>
            getGlobalObject().windows.find((item) => item.key === key),
        add: (window: WindowInfo) => getGlobalObject().windows.push(window),
        exists: (key: string) => getGlobalObject().windows.some((item) => item.key === key),
        close: (key: string) => {
            const windowInfo = WindowManager.windows.get(key)
            if (!windowInfo) {
                return false
            }
            windowInfo.clearViews()
            windowInfo.window.destroy()
            getGlobalObject().windows = getGlobalObject().windows.filter((item) => item.key !== key)

            return true
        },
        clear: () => {
            WindowManager.windows.list().forEach((item) => {
                item.window.close()
            })
            getGlobalObject().windows = []
        }
    },

    createWindow: (
        key: string,
        type: WindowType,
        icon?: string,
        title = WindowConstants.DEFAULT_TITLE,
        toolInfo?: ToolInfo
    ) => {
        const { width, height } = settings.window.getBounds()
        const newWindow = new BrowserWindow({
            minWidth: WindowConstants.WINDOW_MIN_WIDTH,
            minHeight: WindowConstants.WINDOW_MIN_HEIGHT,
            width,
            height,
            titleBarStyle: 'hidden',
            titleBarOverlay: {
                height: WindowConstants.TITLE_BAR_HEIGHT,
                color: '#ffffff00',
                symbolColor: '#888'
            },
            show: false,
            autoHideMenuBar: true,
            title,
            icon: icon ? svgToNativeImage(icon) : appIcon,
            webPreferences: {
                preload: join(__dirname, '../preload/frame.js'),
                additionalArguments: [
                    `--window-type=${type}`,
                    `--window-id=${key}`,
                    '--view-id=frameView',
                    icon ? `--window-icon=${icon}` : '',
                    title ? `--window-title=${title}` : '',
                    toolInfo ? `--tool-info=${btoa(JSON.stringify(toolInfo))}` : ''
                ]
            }
        })
        switch (settings.window.getTheme()) {
            case 'FOLLOW_SYSTEM':
                nativeTheme.themeSource = 'system'
                break
            case 'LIGHT':
                nativeTheme.themeSource = 'light'
                break
            case 'DARK':
                nativeTheme.themeSource = 'dark'
        }
        newWindow.removeMenu()

        newWindow.on('close', (event) => {
            event.preventDefault()
            WindowManager.windows.close(key)
        })
        newWindow.on('resize', () => {
            const { width, height } = newWindow.getContentBounds()
            const menuWidth = (() => {
                switch (type) {
                    case 'main':
                        return WindowManager.menuWidth.get()
                    default:
                        return 0
                }
            })()
            WindowManager.windows.get(key)?.forEachViews(({ view, padding, pin }) => {
                view.setBounds({
                    x: (pin ? 0 : menuWidth) + padding,
                    y: WindowConstants.TITLE_BAR_HEIGHT + padding,
                    width: (pin ? width : width - menuWidth) - padding * 2,
                    height: height - WindowConstants.TITLE_BAR_HEIGHT - padding * 2
                })
            })
        })
        newWindow.on('resized', () => {
            const { width, height } = newWindow.getBounds()
            settings.window.saveBounds({ width, height })
        })
        newWindow.on('maximize', () => settings.window.saveIsMaximize(true))
        newWindow.on('unmaximize', () => settings.window.saveIsMaximize(false))

        newWindow.webContents.setWindowOpenHandler((details) => {
            void shell.openExternal(details.url)
            return { action: 'deny' }
        })
        newWindow.webContents.on('did-finish-load', () => {
            newWindow.show()
            if (is.dev) {
                newWindow.webContents.openDevTools()
            }
        })
        // HMR for renderer base on electron-vite cli.
        // Load the remote URL for development or the local html file for production.
        if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
            void newWindow.webContents.loadURL(process.env['ELECTRON_RENDERER_URL'])
        } else {
            // void mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
            void newWindow.webContents.loadURL(
                `local://oxygen.fatweb.top/${join(__dirname, '../renderer/index.html')}`
            )
        }
        const windowInfo = new WindowInfo(key, type, newWindow)
        WindowManager.windows.add(windowInfo)

        return windowInfo
    },

    getMainWindow: () => WindowManager.windows.get('mainWindow'),
    existsMainWindow: () => WindowManager.windows.exists('mainWindow'),
    createMainWindow: () => {
        if (!WindowManager.existsMainWindow()) {
            WindowManager.createWindow('mainWindow', 'main')
        }
    },
    showMainWindow: () => {
        WindowManager.getMainWindow()?.window.show()
    },
    createIndependentWindow: (toolInfo: ToolInfo) => {
        const viewId = randomUUID()
        const { width, height } = settings.window.getBounds()
        const preload = 'tool.js'
        const menuWidth = WindowManager.menuWidth.get()
        const padding = 20

        const windowInfo = WindowManager.createWindow(
            viewId,
            'independent',
            undefined,
            undefined,
            toolInfo
        )

        const newView = new WebContentsView({
            webPreferences: {
                preload: join(__dirname, `../preload/${preload}`),
                additionalArguments: [`--view-id=${viewId}`]
            }
        })
        newView.setBounds({
            x: menuWidth + padding,
            y: WindowConstants.TITLE_BAR_HEIGHT + padding,
            width: width - menuWidth - padding * 2,
            height: height - WindowConstants.TITLE_BAR_HEIGHT - padding * 2
        })
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

        windowInfo.window.contentView.addChildView(newView)
        windowInfo.addView({ key: viewId, type: 'tool', view: newView, padding, title: '' })
    }
}

export default WindowManager
