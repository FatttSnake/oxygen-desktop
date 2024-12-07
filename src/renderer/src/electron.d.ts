import { Notification } from 'electron'

declare global {
    interface WindowControlsOverlay {
        getTitlebarAreaRect(): DOMRect
        visible: boolean
    }

    interface Navigator {
        windowControlsOverlay?: WindowControlsOverlay
    }

    interface OxygenAPI {
        updateTitleBar: (color: string, symbolColor: string) => void
        onOpenUrl: (callback: (url: string) => void) => void
        changeToolViewVisible: (visible: boolean) => void
        changeToolViewBounds: (x: number, y: number, width: number, height: number) => void
    }

    class Notify extends Notification {}

    declare const oxygenApi: OxygenAPI
}
