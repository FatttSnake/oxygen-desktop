import { ipcMain } from 'electron'
import { IpcEvents } from './constants'
import {
    createTab,
    getAccessToken,
    getAppVersion,
    getLoginAccount,
    getRefreshToken,
    getSidebarIsCollapse,
    getTheme,
    getUserInfo,
    independentTab,
    listTab,
    loadTool,
    openUrlWithDefaultApp,
    removeTab,
    renderTool,
    switchTab,
    updateAccessToken,
    updateLoginAccount,
    updateLoginStatus,
    updateRefreshToken,
    updateSidebarIsCollapse,
    updateSidebarWidth,
    updateTab,
    updateTabIcon,
    updateTabTitle,
    updateTheme,
    updateTitleBarColor,
    updateUserInfo
} from './common'

export const processIpcEvents = () => {
    ipcMain.on(IpcEvents.app.url.open, (_, url: string) => openUrlWithDefaultApp(url))

    ipcMain.handle(IpcEvents.app.version.get, getAppVersion)

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

    ipcMain.handle(
        IpcEvents.window.tab.create,
        (_, type: TabType, args?: Record<string, string | number | boolean>) =>
            createTab(type, args)
    )

    ipcMain.handle(IpcEvents.window.tab.list, listTab)

    ipcMain.on(IpcEvents.window.tab.update, (_, tabs: Tab[]) => updateTab(tabs))

    ipcMain.handle(IpcEvents.window.tab.switch, (_, key: string) => switchTab(key))

    ipcMain.on(IpcEvents.window.tab.close, (_, key: string) => removeTab(key))

    ipcMain.on(IpcEvents.window.tab.independent, (_, key: string) => independentTab(key))

    ipcMain.on(IpcEvents.window.tab.icon, (_, key: string, icon: string) =>
        updateTabIcon(key, icon)
    )

    ipcMain.on(IpcEvents.window.tab.title, (_, key: string, title: string) =>
        updateTabTitle(key, title)
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

    ipcMain.handle(IpcEvents.account.userInfo.get, getUserInfo)

    ipcMain.on(IpcEvents.account.userInfo.update, (_, value?: UserWithPowerInfoVo) =>
        updateUserInfo(value)
    )

    ipcMain.on(IpcEvents.account.loginStatus.update, (_, isLogin: boolean) =>
        updateLoginStatus(isLogin)
    )

    ipcMain.on(
        IpcEvents.tool.view.load,
        (_, username: string, toolId: string, ver?: string, platform?: Platform, source?: string) =>
            loadTool(username, toolId, ver, platform, source)
    )

    ipcMain.on(IpcEvents.tool.view.render, (_, key: string, dist: string) => renderTool(key, dist))
}
