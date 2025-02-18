import { Notification } from 'electron'

declare global {
    interface WindowControlsOverlay {
        getTitlebarAreaRect(): DOMRect
        visible: boolean
    }

    interface Navigator {
        windowControlsOverlay?: WindowControlsOverlay
    }

    type Renderer = 'frame' | 'core' | 'settings' | 'sign' | 'tool'

    type TabType = 'core' | 'settings' | 'sign' | 'tool'

    interface OxygenAPI {
        platform: NodeJS.Platform
        renderer: Renderer
        app: {
            url: {
                open: (url: string) => void
            }
            version: {
                get: () => Promise<string>
            }
        }
        window: {
            theme: {
                get: () => Promise<WindowTheme>
                onUpdate: (callback: (theme: WindowTheme) => void) => void
                update: (theme: WindowTheme) => void
            }
            titleBarOverlay: {
                setColor: (color: string, symbolColor: string) => void
            }
            tab: {
                create: (type: TabType, args?: Record<string, string | number | boolean>) => void
                list: () => Promise<TabInstance[]>
                onUpdate: (callback: (tabs: TabInstance[]) => void) => void
                update: (tabs: TabInstance[]) => void
                onSwitch: (callback: (key: string) => void) => void
                switch: (key: string) => Promise<boolean>
                close: (key: string) => void
                independent: (key: string) => void
            }
        }
        sidebar: {
            width: {
                update: (width: number) => void
            }
            collapse: {
                get: () => Promise<boolean>
                update: (value: boolean) => void
                onUpdate: (callback: (value: boolean) => void) => void
            }
        }
    }

    class Notify extends Notification {}

    declare const oxygenApi: OxygenAPI
}
