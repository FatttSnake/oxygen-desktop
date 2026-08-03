import { ipcMain } from 'electron'
import { IpcEvents } from '#/constants'
import TabManager from '#/app/tabManager'
import {
    afterLoadFrame,
    closeWindow,
    getAccessToken,
    getAppVersion,
    getCsrfToken,
    getLoginAccount,
    getRefreshToken,
    getSidebarIsCollapse,
    getTheme,
    getUserInfo,
    loadTool,
    openDevTools,
    openUrlWithDefaultApp,
    renderTool,
    updateAccessToken,
    updateCsrfToken,
    updateLoginAccount,
    updateLoginStatus,
    updateRefreshToken,
    updateSidebarIsCollapse,
    updateSidebarMenu,
    updateSidebarWidth,
    updateTheme,
    updateTitleBarColor,
    updateUserInfo
} from '#/app/services'

export default () => {
    ipcMain.on(IpcEvents.app.url.open, (_, url: string) => openUrlWithDefaultApp(url))

    ipcMain.handle(IpcEvents.app.version.get, getAppVersion)

    ipcMain.on(IpcEvents.window.base.close, (_, key: string) => closeWindow(key))

    ipcMain.on(IpcEvents.window.base.afterLoad, (_, key: string) => afterLoadFrame(key))

    ipcMain.handle(IpcEvents.window.theme.get, getTheme)

    ipcMain.on(IpcEvents.window.theme.update, (_, theme: WindowTheme) => updateTheme(theme))

    ipcMain.on(IpcEvents.window.titleBarOverlay.setColor, (_, color: string, symbolColor: string) =>
        updateTitleBarColor(color, symbolColor)
    )

    ipcMain.on(IpcEvents.sidebar.width.update, (_, menuWidth: number) =>
        updateSidebarWidth(menuWidth)
    )

    ipcMain.handle(IpcEvents.sidebar.collapse.get, getSidebarIsCollapse)

    ipcMain.on(IpcEvents.sidebar.collapse.update, (_, value: boolean) =>
        updateSidebarIsCollapse(value)
    )

    ipcMain.on(IpcEvents.sidebar.menu.update, updateSidebarMenu)

    ipcMain.handle(
        IpcEvents.window.tab.create,
        (_, type: TabType, args?: Record<string, string | number | boolean>) =>
            TabManager.createTab(type, args)
    )

    ipcMain.handle(IpcEvents.window.tab.list, TabManager.listTab)

    ipcMain.on(IpcEvents.window.tab.update, (_, tabs: Tab[]) => TabManager.updateTab(tabs))

    ipcMain.handle(IpcEvents.window.tab.switch, (_, key: string) => TabManager.switchTab(key))

    ipcMain.on(IpcEvents.window.tab.close, (_, key: string) => TabManager.removeTab(key))

    ipcMain.on(IpcEvents.window.tab.independent, (_, key: string) => TabManager.independentTab(key))

    ipcMain.on(IpcEvents.window.tab.icon, (_, key: string, icon: string) =>
        TabManager.updateTabIcon(key, icon)
    )

    ipcMain.on(IpcEvents.window.tab.title, (_, key: string, title: string) =>
        TabManager.updateTabTitle(key, title)
    )

    ipcMain.handle(IpcEvents.account.loginAccount.get, getLoginAccount)

    ipcMain.on(IpcEvents.account.loginAccount.update, (_, value?: string) =>
        updateLoginAccount(value)
    )

    ipcMain.handle(IpcEvents.account.refreshToken.get, getRefreshToken)

    ipcMain.on(IpcEvents.account.refreshToken.update, (_, value?: string) =>
        updateRefreshToken(value)
    )

    ipcMain.handle(IpcEvents.account.accessToken.get, getAccessToken)

    ipcMain.on(IpcEvents.account.accessToken.update, (_, value?: string) =>
        updateAccessToken(value)
    )

    ipcMain.handle(IpcEvents.account.csrfToken.get, getCsrfToken)

    ipcMain.on(IpcEvents.account.csrfToken.update, (_, value?: string) => updateCsrfToken(value))

    ipcMain.handle(IpcEvents.account.userInfo.get, getUserInfo)

    ipcMain.on(IpcEvents.account.userInfo.update, (_, value?: UserWithPowerInfoVo) =>
        updateUserInfo(value)
    )

    ipcMain.on(IpcEvents.account.loginStatus.update, (_, isLogin: boolean) =>
        updateLoginStatus(isLogin)
    )

    ipcMain.on(
        IpcEvents.tool.view.load,
        (_, username: string, toolId: string, platform?: Platform, ver?: string, source?: string) =>
            loadTool(username, toolId, platform, ver, source)
    )

    ipcMain.on(IpcEvents.tool.view.render, (_, dist: string, key?: string) => renderTool(dist, key))

    ipcMain.handle(IpcEvents.tool.view.devtools, (_, key: string) => openDevTools(key))
}
