import { contextBridge } from 'electron'
import { createApi, getArgv } from '%/functions'

const viewId = getArgv('viewId')
const navigateTo = getArgv('navigateTo')
const api = createApi()

const oxygenApi = {
    platform: process.platform,
    renderer: 'settings',
    viewId,
    navigateTo,

    app: {
        url: {
            open: api.app.url.open
        },
        version: {
            get: api.app.version.get
        }
    },
    window: {
        theme: {
            get: api.window.theme.get,
            onUpdate: api.window.theme.onUpdate,
            offUpdate: api.window.theme.offUpdate,
            update: api.window.theme.update
        },
        navigate: {
            onGoto: api.window.navigate.onGoto,
            offGoto: api.window.navigate.offGoto
        },
        tab: {
            create: api.window.tab.create,
            switch: api.window.tab.switch,
            close: api.window.tab.close,
            onClosed: api.window.tab.onClosed,
            offClosed: api.window.tab.offClosed,
            icon: api.window.tab.icon,
            title: api.window.tab.title
        }
    },
    sidebar: {
        collapse: {
            get: api.sidebar.collapse.get,
            onUpdate: api.sidebar.collapse.onUpdate,
            offUpdate: api.sidebar.collapse.offUpdate
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
            render: api.tool.view.render,
            devtools: api.tool.view.devtools
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
