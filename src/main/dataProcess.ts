import { ipcMain } from 'electron'
import { listTool, installTool, uninstallTool } from './dataStore/tool'

ipcMain.handle('store:getInstalledTool', () => listTool())

ipcMain.handle('store:installTool', (_, value: Record<string, Record<Platform, ToolVo>>) =>
    installTool(value)
)

ipcMain.handle('store:uninstallTool', (_, value: string) => uninstallTool(value))
