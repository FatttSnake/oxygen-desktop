import store from '#/dataStore/store'

const getCache = () => store.get('config_cache')

const saveCache = (value: SystemConfig) => store.set('config_cache', value)

export default {
    getCache,
    saveCache
}
