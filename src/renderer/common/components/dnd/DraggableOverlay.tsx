import { PropsWithChildren } from 'react'
import { defaultDropAnimationSideEffects, DragOverlay, DropAnimation } from '@dnd-kit/core'

interface DraggableOverlayProps extends PropsWithChildren {
    isDelete?: boolean
}

const dropAnimationConfig: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0.4'
            }
        }
    })
}

const DraggableOverlay = ({ children }: DraggableOverlayProps) => {
    return <DragOverlay dropAnimation={dropAnimationConfig}>{children}</DragOverlay>
}

export default DraggableOverlay
