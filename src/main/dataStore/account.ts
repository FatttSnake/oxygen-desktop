import { safeStorage } from 'electron'
import store from '#/dataStore/store'

const getLoginAccount = () => store.get('account_loginAccount')

const saveLoginAccount = (value?: string) =>
    value ? store.set('account_loginAccount', value) : store.delete('account_loginAccount')

const getAccessToken = () => {
    const accessToken = store.get('account_accessToken')

    return accessToken ? safeStorage.decryptString(Buffer.from(accessToken, 'base64')) : undefined
}

const saveAccessToken = (value?: string) =>
    value
        ? store.set('account_accessToken', safeStorage.encryptString(value).toString('base64'))
        : store.delete('account_accessToken')

const getRefreshToken = () => {
    const refreshToken = store.get('account_refreshToken')

    return refreshToken ? safeStorage.decryptString(Buffer.from(refreshToken, 'base64')) : undefined
}

const saveRefreshToken = (value?: string) =>
    value
        ? store.set('account_refreshToken', safeStorage.encryptString(value).toString('base64'))
        : store.delete('account_refreshToken')

const getCsrfToken = () => {
    const csrfToken = store.get('account_csrfToken')

    return csrfToken ? safeStorage.decryptString(Buffer.from(csrfToken, 'base64')) : undefined
}

const saveCsrfToken = (value?: string) =>
    value
        ? store.set('account_csrfToken', safeStorage.encryptString(value).toString('base64'))
        : store.delete('account_csrfToken')

const getUserInfo = () => store.get('account_userInfo')

const saveUserInfo = (value?: UserWithPowerInfoVo) =>
    value ? store.set('account_userInfo', value) : store.delete('account_userInfo')

export default {
    getLoginAccount,
    saveLoginAccount,
    getAccessToken,
    saveAccessToken,
    getRefreshToken,
    saveRefreshToken,
    getCsrfToken,
    saveCsrfToken,
    getUserInfo,
    saveUserInfo
}
