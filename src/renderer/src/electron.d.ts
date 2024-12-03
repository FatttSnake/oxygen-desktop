import { ElectronAPI } from '@electron-toolkit/preload'
import { Notification } from 'electron'

declare global {
    type _ElectronAPI = ElectronAPI

    class _Notification extends Notification {}

    interface API {
        updateTitleBar: (color: string, symbolColor: string) => void
        getInstalledTool: () => Promise<Record<string, Record<Platform, ToolVo>>>
        installTool: (
            newTools: Record<string, Record<Platform, ToolVo>>
        ) => Promise<Record<string, Record<Platform, ToolVo>>>
        uninstallTool: (key: string) => Promise<Record<string, Record<Platform, ToolVo>>>
    }
}
