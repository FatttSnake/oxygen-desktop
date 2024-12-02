import { ipcMain } from 'electron'
import { listTool, installTool } from './dataStore/tool'

ipcMain.handle('store:installTool', (_, value: Record<string, Record<Platform, ToolVo>>) =>
    installTool(value)
)

ipcMain.handle('store:getInstalledTool', () => listTool())
