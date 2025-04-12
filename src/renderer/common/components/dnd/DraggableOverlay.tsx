import { PropsWithChildren } from 'react'
import { defaultDropAnimationSideEffects, DragOverlay, DropAnimation } from '@dnd-kit/core'

interface DraggableOverlayProps {
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

const DraggableOverlay = ({ children }: PropsWithChildren<DraggableOverlayProps>) => {
    return <DragOverlay dropAnimation={dropAnimationConfig}>{children}</DragOverlay>
}

export default DraggableOverlay
