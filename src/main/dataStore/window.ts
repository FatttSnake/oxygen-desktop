import store from './store'

const getBounds = () => store.get('window_bounds')

const saveBounds = (value: WindowBounds) => store.set('window_bounds', value)

const getIsMaximize = () => store.get('window_isMaximize')

const saveIsMaximize = (value: boolean) => store.set('window_isMaximize', value)

const getTheme = () => store.get('window_theme')

const saveTheme = (value: WindowTheme) => store.set('window_theme', value)

export default {
    getBounds,
    saveBounds,
    getIsMaximize,
    saveIsMaximize,
    getTheme,
    saveTheme
}
