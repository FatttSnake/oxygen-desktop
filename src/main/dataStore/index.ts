import Store, { Schema } from 'electron-store'

const schema: Schema<StoreSchema> = {
    windowBounds: {
        default: {
            width: 1200,
            height: 800
        }
    },
    maximize: {
        default: false
    },
    installedTools: {
        default: []
    }
}

export default new Store<StoreSchema>({ schema })
