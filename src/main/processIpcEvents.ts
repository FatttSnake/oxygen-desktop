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
    openUrlWithDefaultApp,
    removeTab,
    switchTab,
    updateAccessToken,
    updateLoginAccount,
    updateLoginStatus,
    updateRefreshToken,
    updateSidebarIsCollapse,
    updateSidebarWidth,
    updateTab,
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

    ipcMain.on(
        IpcEvents.window.tab.create,
        (_, type: TabType, args?: Record<string, string | number | boolean>) =>
            createTab(type, args)
    )

    ipcMain.handle(IpcEvents.window.tab.list, listTab)

    ipcMain.on(IpcEvents.window.tab.update, (_, tabs: Tab[]) => updateTab(tabs))

    ipcMain.handle(IpcEvents.window.tab.switch, (_, key: string) => switchTab(key))

    ipcMain.on(IpcEvents.window.tab.close, (_, key: string) => removeTab(key))

    ipcMain.on(IpcEvents.window.tab.independent, (_, key: string) => independentTab(key))

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
}
