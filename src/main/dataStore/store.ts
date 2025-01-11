import Store, { Schema } from 'electron-store'

const schema: Schema<StoreSchema> = {
    window_bounds: {
        default: {
            width: 1200,
            height: 800
        }
    },
    window_isMaximize: {
        default: false
    },
    window_theme: {
        default: 'FOLLOW_SYSTEM' as WindowTheme
    },
    sidebar_isCollapsed: {
        default: false
    },
    sidebar_menuItems: {
        default: []
    }
}

export default new Store<StoreSchema>({ schema })
