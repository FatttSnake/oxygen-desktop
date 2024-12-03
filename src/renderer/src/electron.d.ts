import { Notification } from 'electron'

declare global {
    interface WindowControlsOverlay {
        getTitlebarAreaRect(): DOMRect
        visible: boolean
    }

    interface Navigator {
        windowControlsOverlay?: WindowControlsOverlay
    }

    interface ElectronAPI {
        onOpenUrl: (callback: (url: string) => void) => void
    }

    class _Notification extends Notification {}

    interface BaseAPI {
        updateTitleBar: (color: string, symbolColor: string) => void
        getInstalledTool: () => Promise<Record<string, Record<Platform, ToolVo>>>
        installTool: (
            newTools: Record<string, Record<Platform, ToolVo>>
        ) => Promise<Record<string, Record<Platform, ToolVo>>>
        uninstallTool: (key: string) => Promise<Record<string, Record<Platform, ToolVo>>>
    }
}
