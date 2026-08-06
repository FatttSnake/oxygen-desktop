import { contextBridge } from 'electron'
import { createApi, getArgv } from '%/functions'

const viewId = getArgv('viewId')
const api = createApi()

const oxygenApi = {
    platform: process.platform,
    renderer: 'sign',
    viewId,

    app: {
        config: {
            get: api.app.config.get,
            onUpdate: api.app.config.onUpdate,
            offUpdate: api.app.config.offUpdate,
            reload: api.app.config.reload
        }
    },
    window: {
        theme: {
            get: api.window.theme.get,
            onUpdate: api.window.theme.onUpdate,
            offUpdate: api.window.theme.offUpdate
        },
        tab: {
            switch: api.window.tab.switch,
            close: api.window.tab.close
        },
        navigate: {
            onGoto: api.window.navigate.onGoto,
            offGoto: api.window.navigate.offGoto
        }
    },
    account: {
        loginAccount: {
            get: api.account.loginAccount.get,
            update: api.account.loginAccount.update
        },
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
    }
}

if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('oxygenApi', oxygenApi)
    } catch (error) {
        console.error(error)
    }
}
