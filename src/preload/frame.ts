import { contextBridge } from 'electron'
import { createApi, getArgv } from '%/functions'

const windowType = getArgv('windowType')
const windowId = getArgv('windowId')
const viewId = getArgv('viewId')
const windowIcon = getArgv('windowIcon')
const windowTitle = getArgv('windowTitle')
const toolInfo = getArgv('toolInfo')
const api = createApi(windowId)

const oxygenApi = {
    platform: process.platform,
    renderer: 'frame',
    windowType,
    windowId,
    viewId,
    windowIcon,
    windowTitle,
    toolInfo,

    window: {
        base: {
            close: api.window.base.close,
            afterLoad: api.window.base.afterLoad,
            onIcon: api.window.base.onIcon,
            offIcon: api.window.base.offIcon,
            onTitle: api.window.base.onTitle,
            offTitle: api.window.base.offTitle
        },
        theme: {
            get: api.window.theme.get,
            onUpdate: api.window.theme.onUpdate,
            offUpdate: api.window.theme.offUpdate
        },
        titleBarOverlay: {
            setColor: api.window.titleBarOverlay.setColor
        },
        tab: {
            create: api.window.tab.create,
            list: api.window.tab.list,
            onUpdate: api.window.tab.onUpdate,
            offUpdate: api.window.tab.offUpdate,
            update: api.window.tab.update,
            onSwitch: api.window.tab.onSwitch,
            offSwitch: api.window.tab.offSwitch,
            switch: api.window.tab.switch,
            close: api.window.tab.close,
            independent: api.window.tab.independent,
            icon: api.window.tab.icon,
            title: api.window.tab.title
        }
    },
    sidebar: {
        width: {
            update: api.sidebar.width.update
        },
        collapse: {
            get: api.sidebar.collapse.get,
            onUpdate: api.sidebar.collapse.onUpdate,
            offUpdate: api.sidebar.collapse.offUpdate,
            update: api.sidebar.collapse.update
        },
        menu: {
            onUpdate: api.sidebar.menu.onUpdate,
            offUpdate: api.sidebar.menu.offUpdate
        }
    },
    account: {
        accessToken: {
            get: api.account.accessToken.get,
            onUpdate: api.account.accessToken.onUpdate,
            offUpdate: api.account.accessToken.offUpdate,
            update: api.account.accessToken.update
        },
        refreshToken: {
            get: api.account.refreshToken.get,
            onUpdate: api.account.refreshToken.onUpdate,
            offUpdate: api.account.refreshToken.offUpdate,
            update: api.account.refreshToken.update
        },
        csrfToken: {
            get: api.account.csrfToken.get,
            onUpdate: api.account.csrfToken.onUpdate,
            offUpdate: api.account.csrfToken.offUpdate,
            update: api.account.csrfToken.update
        },
        userInfo: {
            get: api.account.userInfo.get,
            onUpdate: api.account.userInfo.onUpdate,
            offUpdate: api.account.userInfo.offUpdate,
            update: api.account.userInfo.update
        },
        loginStatus: {
            onUpdate: api.account.loginStatus.onUpdate,
            offUpdate: api.account.loginStatus.offUpdate,
            update: api.account.loginStatus.update
        }
    },
    tool: {
        view: {
            onLoad: api.tool.view.onLoad,
            offLoad: api.tool.view.offLoad,
            load: api.tool.view.load,
            render: api.tool.view.render
        }
    }
}

if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('oxygenApi', oxygenApi)
    } catch (error) {
        console.error(error)
    }
}
