import { CSSProperties, PropsWithChildren } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { HandleContext, HandleContextInst } from '@/components/dnd/HandleContext'

interface DraggableProps extends PropsWithChildren {
    id: string
    data: ToolMenuItem
}

const Draggable = ({ id, data, children }: DraggableProps) => {
    const {
        attributes,
        isDragging,
        listeners,
        setNodeRef: draggableRef,
        setActivatorNodeRef,
        transform
    } = useDraggable({
        id,
        data
    })
    const context = useMemo<HandleContext>(
        () => ({
            attributes,
            listeners,
            ref: setActivatorNodeRef
        }),
        [attributes, listeners, setActivatorNodeRef]
    )
    const style: CSSProperties | undefined = transform
        ? {
              opacity: isDragging ? 0 : undefined,
              transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
              zIndex: 10000
          }
        : undefined

    return (
        <HandleContextInst.Provider value={context}>
            <div ref={draggableRef} style={style}>
                {children}
            </div>
        </HandleContextInst.Provider>
    )
}

export default Draggable
