import { BrowserWindow, WebContentsView, IpcRendererEvent } from 'electron'

declare global {
    type _BrowserWindow = BrowserWindow

    type _WebContentsView = WebContentsView

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type IpcRendererEventListener = (event: IpcRendererEvent, ...args: any[]) => void
}
