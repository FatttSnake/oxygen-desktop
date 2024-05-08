import Store, { Schema } from 'electron-store'
import { ipcMain } from 'electron'

const schema: Schema<StoreSchema> = {
    installedTools: {
        default: []
    }
}

const store = new Store<StoreSchema>({ schema })

ipcMain.handle('store:installTool', (_, value: Record<string, Record<Platform, ToolVo>>) => {
    const installedTools = store.get('installedTools')

    store.set('installedTools', { ...installedTools, ...value })
    return store.get('installedTools')
})

ipcMain.handle('store:getInstalledTool', () => {
    return store.get('installedTools')
})
