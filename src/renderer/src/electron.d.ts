import { ElectronAPI } from '@electron-toolkit/preload'
import { Notification } from 'electron'

declare global {
    type _ElectronAPI = ElectronAPI

    class _Notification extends Notification {}

    interface API {
        installTool: (
            newTools: Record<string, Record<Platform, ToolVo>>
        ) => Promise<Record<string, Record<Platform, ToolVo>>>

        getInstalledTool: () => Promise<Record<string, Record<Platform, ToolVo>>>
    }
}
