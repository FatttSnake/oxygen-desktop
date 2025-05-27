import store from '#/dataStore/store'

const getLoginAccount = () => store.get('account_loginAccount')

const saveLoginAccount = (value?: string) =>
    value ? store.set('account_loginAccount', value) : store.delete('account_loginAccount')

const getAccessToken = () => store.get('account_accessToken')

const saveAccessToken = (value?: string) =>
    value ? store.set('account_accessToken', value) : store.delete('account_accessToken')

const getRefreshToken = () => store.get('account_refreshToken')

const saveRefreshToken = (value?: string) =>
    value ? store.set('account_refreshToken', value) : store.delete('account_refreshToken')

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
    getUserInfo,
    saveUserInfo
}
