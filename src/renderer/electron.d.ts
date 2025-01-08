import { Notification } from 'electron'
import { Tab } from '#/components/TabList.tsx'

declare global {
    interface WindowControlsOverlay {
        getTitlebarAreaRect(): DOMRect
        visible: boolean
    }

    interface Navigator {
        windowControlsOverlay?: WindowControlsOverlay
    }

    type Renderer = 'frame' | 'menu' | 'main' | 'tool'

    interface OxygenAPI {
        platform: NodeJS.Platform
        renderer: Renderer
        updateTitleBar: (color: string, symbolColor: string) => void
        updateMenuWidth: (width: number) => void
        onOpenUrl: (callback: (url: string) => void) => void
        createNewTab: (url: string) => void
        listTabs: () => Promise<Tab[]>
        onUpdateTab: (callback: (tabs: Tab[]) => void) => void
        updateTabs: (tabs: Tab[]) => void
        onSwitchTab: (callback: (key: string) => void) => void
        switchTab: (key: string) => void
        closeTab: (key: string) => void
        independentTab: (key: string) => void
    }

    class Notify extends Notification {}

    declare const oxygenApi: OxygenAPI
}
