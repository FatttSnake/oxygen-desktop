import { shell, app, nativeTheme } from 'electron'
import { IpcEvents, WindowConstants } from '#/constants'
import { settings } from '#/dataStore'
import WindowManager from '#/app/windowManager'

export const openUrlWithDefaultApp = shell.openExternal

export const getAppVersion = app.getVersion

export const closeWindow = (key: string) => {
    WindowManager.windows.get(key)?.window.close()
}

export const afterLoadFrame = (key: string) => {
    const windowInfo = WindowManager.windows.get(key)
    if (!windowInfo) {
        return
    }

    if (settings.window.getIsMaximize()) {
        windowInfo.window.maximize()
    }
    if (windowInfo.type === 'independent') {
        windowInfo.forEachViews(({ view }) => view.setVisible(true))

        const { width, height } = windowInfo.window.getContentBounds()
        windowInfo.forEachViews(({ view, padding }) => {
            view.setBounds({
                x: padding,
                y: WindowConstants.TITLE_BAR_HEIGHT + padding,
                width: width - padding * 2,
                height: height - WindowConstants.TITLE_BAR_HEIGHT - padding * 2
            })
        })
    }
}

export const getTheme = settings.window.getTheme

export const updateTheme = (theme: WindowTheme) => {
    settings.window.saveTheme(theme)
    WindowManager.windows.forEach((windowInfo) =>
        windowInfo.forEachWebContents((item) => item.send(IpcEvents.window.theme.update, theme))
    )

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
        WindowManager.windows.forEach(({ window }) => {
            window?.setTitleBarOverlay({
                color,
                symbolColor,
                height: WindowConstants.TITLE_BAR_HEIGHT
            })
        })
    }
}

export const updateSidebarWidth = (menuWidth: number) => {
    WindowManager.menuWidth.set(menuWidth)
    const mainWindowInfo = WindowManager.getMainWindow()
    if (!mainWindowInfo) {
        return
    }
    const { width, height } = mainWindowInfo.window.getContentBounds()
    mainWindowInfo.forEachViews(({ view, padding, pin }) => {
        if (pin) {
            return
        }
        view.setBounds({
            x: menuWidth + padding,
            y: WindowConstants.TITLE_BAR_HEIGHT + padding,
            width: width - menuWidth - padding * 2,
            height: height - WindowConstants.TITLE_BAR_HEIGHT - padding * 2
        })
    })
}

export const getSidebarIsCollapse = settings.sidebar.getIsCollapsed

export const updateSidebarIsCollapse = (isCollapse: boolean) => {
    settings.sidebar.saveIsCollapsed(isCollapse)
    const mainWindowInfo = WindowManager.getMainWindow()
    if (!mainWindowInfo) {
        return
    }
    mainWindowInfo.forEachPinWebContents((item) =>
        item.send(IpcEvents.sidebar.collapse.update, isCollapse)
    )
}

export const updateSidebarMenu = () =>
    WindowManager.getMainWindow()?.window.webContents.send(IpcEvents.sidebar.menu.update)

export const getLoginAccount = settings.account.getLoginAccount

export const updateLoginAccount = (account?: string) => settings.account.saveLoginAccount(account)

export const getRefreshToken = settings.account.getRefreshToken

export const updateRefreshToken = (refreshToken?: string) => {
    settings.account.saveRefreshToken(refreshToken)
    WindowManager.windows.forEach((windowInfo) => {
        windowInfo.forEachPinWebContents((item) =>
            item.send(IpcEvents.account.refreshToken.update, refreshToken)
        )
    })
}

export const getAccessToken = settings.account.getAccessToken

export const updateAccessToken = (accessToken?: string) => {
    settings.account.saveAccessToken(accessToken)
    WindowManager.windows.forEach((windowInfo) => {
        windowInfo.forEachPinWebContents((item) =>
            item.send(IpcEvents.account.accessToken.update, accessToken)
        )
    })
}

export const getUserInfo = settings.account.getUserInfo

export const updateUserInfo = (userInfo?: UserWithPowerInfoVo) => {
    settings.account.saveUserInfo(userInfo)
    WindowManager.windows.forEach((windowInfo) => {
        windowInfo.forEachPinWebContents((item) =>
            item.send(IpcEvents.account.userInfo.update, userInfo)
        )
    })
}

export const updateLoginStatus = (isLogin: boolean) =>
    WindowManager.windows.forEach((windowInfo) => {
        windowInfo.forEachWebContents((item) =>
            item.send(IpcEvents.account.loginStatus.update, isLogin)
        )
    })

export const loadTool = (
    username: string,
    toolId: string,
    platform?: Platform,
    ver?: string,
    source?: string
) =>
    WindowManager.getMainWindow()?.window.webContents.send(
        IpcEvents.tool.view.load,
        username,
        toolId,
        platform,
        ver,
        source
    )

export const renderTool = (dist: string, key?: string) =>
    key
        ? WindowManager.windows.forEach((windowInfo) => {
              windowInfo.getView(key)?.view.webContents.executeJavaScript(dist)
          })
        : WindowManager.getMainWindow()?.forEachViews(({ type, view }) => {
              if (type === 'tool') {
                  void view.webContents.executeJavaScript(dist)
              }
          })
