import { join } from 'path'
import { randomUUID } from 'node:crypto'
import { kebabCase } from 'lodash'
import { WebContentsView, WebContents, shell, app, nativeTheme } from 'electron'
import { is } from '@electron-toolkit/utils'
import { IpcEvents } from './constants'
import { settings } from './dataStore'

export const getGlobalObject = (): SharedObject => global.sharedObject

export const getViews = () => getGlobalObject().views

export const getMainWindow = () => getGlobalObject().mainWindow

export const forEachViews = (callback: (value: ViewInfo) => void) => getViews().forEach(callback)

export const forEachAllWebContents = (callback: (value: WebContents) => void) => {
    callback(getMainWindow().webContents)
    getViews()
        .map((v) => v.view.webContents)
        .forEach(callback)
}

export const forEachPinWebContents = (callback: (value: WebContents) => void) => {
    callback(getMainWindow().webContents)
    getViews()
        .filter((v) => v.pin)
        .map((v) => v.view.webContents)
        .forEach(callback)
}

export const openUrlWithDefaultApp = shell.openExternal

export const getAppVersion = app.getVersion

export const getTheme = settings.window.getTheme

export const updateTheme = (theme: WindowTheme) => {
    settings.window.saveTheme(theme)
    forEachAllWebContents((item) => item.send(IpcEvents.window.theme.update, theme))

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
}

export const updateTitleBarColor = (color: string, symbolColor: string) => {
    if (['win32', 'linux'].includes(process.platform)) {
        getMainWindow().setTitleBarOverlay({ color, symbolColor, height: 40 })
    }
}

export const updateSidebarWidth = (menuWidth: number) => {
    getGlobalObject().menuWidth = menuWidth
    const { width, height } = getMainWindow().getContentBounds()
    forEachViews(({ view, padding, pin }) => {
        if (pin) {
            return
        }
        view.setBounds({
            x: menuWidth + padding,
            y: 40 + padding,
            width: width - menuWidth - padding * 2,
            height: height - 40 - padding * 2
        })
    })
}

export const getSidebarIsCollapse = settings.sidebar.getIsCollapsed

export const updateSidebarIsCollapse = (isCollapse: boolean) => {
    settings.sidebar.saveIsCollapsed(isCollapse)
    forEachPinWebContents((item) => item.send(IpcEvents.sidebar.collapse.update, isCollapse))
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
): Tab => {
    !renderTool &&
        view.webContents.on('page-title-updated', (_, title) => {
            forEachViews((item) => {
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
            forEachViews((item) => {
                if (item.key === viewId) {
                    item.icon = icon
                    handleUpdateTabs()
                }
            })
        })
    getViews().push({
        key: viewId,
        type,
        view,
        padding,
        title,
        pin,
        persistent
    })
    handleUpdateTabs()
    return { key: viewId, type, padding, title, pin, persistent }
}

export const createTab = (type: TabType, args?: Record<string, string | number | boolean>) => {
    if (type === 'core' && getViews().some(({ key }) => key === 'coreView')) {
        switchTab('coreView')
        return
    }
    if (type === 'settings' && getViews().some(({ key }) => key === 'settingsView')) {
        switchTab('settingsView')
        args?.['navigateTo'] &&
            getGlobalObject()
                .views.find(({ key }) => key === 'settingsView')
                ?.view.webContents.send(IpcEvents.window.navigate.goto, args['navigateTo'])
        return
    }
    if (type === 'sign' && getViews().some(({ key }) => key === 'signView')) {
        switchTab('signView')
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
                    menuWidth: getGlobalObject().menuWidth,
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

    const { width, height } = getMainWindow().getContentBounds()
    newView.setBounds({
        x: menuWidth + padding,
        y: 40 + padding,
        width: width - menuWidth - padding * 2,
        height: height - 40 - padding * 2
    })
    newView.setVisible(false)
    newView.setBackgroundColor('rgba(0, 0, 0, 0)')
    newView.webContents.setWindowOpenHandler((details) => {
        void shell.openExternal(details.url)
        return { action: 'deny' }
    })
    newView.webContents.on('did-finish-load', () => {
        getMainWindow().show()
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

    addTab(newView, viewId, type, padding, title, pin, persistent, renderTool)
    getMainWindow().contentView.addChildView(newView)
    switchTab(viewId)

    return viewId
}

export const listTab = () =>
    getViews().map(
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

export const updateTab = (tabs: Tab[]) => {
    getGlobalObject().views = tabs
        .map((tab) => getViews().find((item) => item.key === tab.key))
        .filter((item) => item !== undefined)
    handleUpdateTabs()
}

export const switchTab = (key: string): boolean => {
    if (!getViews().find((item) => item.key === key)) {
        return false
    }

    forEachViews((item) => {
        item.view.setVisible(item.key === key)
    })
    getMainWindow().webContents.send(IpcEvents.window.tab.switch, key)
    return true
}

export const removeTab = (key: string) => {
    getGlobalObject().views = getViews().filter((item) => {
        if (item.key === key) {
            getMainWindow().contentView.removeChildView(item.view)
            item.view.webContents.close()
        }
        return item.key !== key
    })
    handleUpdateTabs()
}

export const independentTab = (key: string) => {
    console.warn('Not Supported', key)
}

export const updateTabIcon = (key: string, icon: string) => {
    forEachViews((item) => {
        if (item.key === key) {
            item.icon = icon
            handleUpdateTabs()
        }
    })
}

export const updateTabTitle = (key: string, title: string) => {
    forEachViews((item) => {
        if (item.key === key) {
            item.title = title
            handleUpdateTabs()
        }
    })
}

const handleUpdateTabs = () => {
    getMainWindow().webContents.send(
        IpcEvents.window.tab.update,
        getViews().map(
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

export const getLoginAccount = settings.account.getLoginAccount

export const updateLoginAccount = (account?: string) => settings.account.saveLoginAccount(account)

export const getRefreshToken = settings.account.getRefreshToken

export const updateRefreshToken = (refreshToken?: string) => {
    settings.account.saveRefreshToken(refreshToken)
    forEachPinWebContents((item) => item.send(IpcEvents.account.refreshToken.update, refreshToken))
}

export const getAccessToken = settings.account.getAccessToken

export const updateAccessToken = (accessToken?: string) => {
    settings.account.saveAccessToken(accessToken)
    forEachPinWebContents((item) => item.send(IpcEvents.account.accessToken.update, accessToken))
}

export const getUserInfo = settings.account.getUserInfo

export const updateUserInfo = (userInfo?: UserWithPowerInfoVo) => {
    settings.account.saveUserInfo(userInfo)
    forEachPinWebContents((item) => item.send(IpcEvents.account.userInfo.update, userInfo))
}

export const updateLoginStatus = (isLogin: boolean) =>
    forEachAllWebContents((item) => item.send(IpcEvents.account.loginStatus.update, isLogin))

export const loadTool = (
    username: string,
    toolId: string,
    ver?: string,
    platform?: Platform,
    source?: string
) =>
    getMainWindow().webContents.send(
        IpcEvents.tool.view.load,
        username,
        toolId,
        ver,
        platform,
        source
    )

export const renderTool = (dist: string, key?: string) =>
    key
        ? getViews()
              .find((item) => item.key === key)
              ?.view.webContents.executeJavaScript(dist)
        : forEachViews(({ type, view }) => {
              if (type === 'tool') {
                  void view.webContents.executeJavaScript(dist)
              }
          })
