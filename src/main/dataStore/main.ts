import store from '.'

export const getWindowBounds = () => store.get('windowBounds')

export const saveWindowBounds = (newWindowBounds: WindowBounds) =>
    store.set('windowBounds', newWindowBounds)

export const getMaximize = () => store.get('maximize')

export const saveMaximize = (maximize: boolean) => store.set('maximize', maximize)
