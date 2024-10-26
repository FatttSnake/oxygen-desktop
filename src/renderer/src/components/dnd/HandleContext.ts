import { DraggableSyntheticListeners } from '@dnd-kit/core'

export interface HandleContext {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    attributes: Record<string, any>
    listeners: DraggableSyntheticListeners
    ref(node: HTMLElement | null): void
}

export const HandleContextInst = createContext<HandleContext>({
    attributes: {},
    listeners: undefined,
    ref() {}
})
