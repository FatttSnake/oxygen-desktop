import { join } from 'path'
import { BrowserWindow, nativeTheme, shell, WebContents } from 'electron'
import { is } from '@electron-toolkit/utils'
import icon from '../../build/icon.ico?asset'
import { settings } from './dataStore'
import { WindowConstants } from './constants'

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
    public setViews = (views: ViewInfo[]) => {
        this.views = views
    }
    public addView = (view: ViewInfo) => this.listViews().push(view)
    public existsView = (key: string) => this.listViews().some((view) => view.key === key)
    public closeView = (key: string) => {
        if (!this.existsView(key)) {
            return false
        }

        this.getView(key)?.view.webContents.close()
        this.setViews(this.listViews().filter((view) => view.key !== key))

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
            if (!WindowManager.windows.exists(key)) {
                return false
            }
            WindowManager.windows.get(key)?.window.close()
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

    createWindow: (key: string, type: WindowType) => {
        const { width, height } = settings.window.getBounds()
        const newWindow = new BrowserWindow({
            minWidth: WindowConstants.WINDOW_MIN_WIDTH,
            minHeight: WindowConstants.WINDOW_MIN_HEIGHT,
            width,
            height,
            titleBarStyle: 'hidden',
            titleBarOverlay: {
                height: WindowConstants.TITLE_BAR_HEIGHT
            },
            show: false,
            autoHideMenuBar: true,
            icon,
            webPreferences: {
                preload: join(__dirname, '../preload/frame.js')
            }
        })
        if (settings.window.getIsMaximize()) {
            newWindow.maximize()
        }
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
                    y: 40 + padding,
                    width: (pin ? width : width - menuWidth) - padding * 2,
                    height: height - 40 - padding * 2
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
        WindowManager.windows.add(new WindowInfo(key, type, newWindow))
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
    }
}

export default WindowManager
