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
    }
}
