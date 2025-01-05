import { CSSProperties, PropsWithChildren } from 'react'
import { cx } from 'antd-style'
import { Data } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { HandleContext, HandleContextInst } from '$/components/dnd/HandleContext'

interface SortableProps extends PropsWithChildren {
    id: string
    data?: Data
    isOver?: boolean
    className?: string
    hasDragHandle?: boolean
}

const Sortable = ({ id, data, isOver, className, hasDragHandle, children }: SortableProps) => {
    const {
        attributes,
        isDragging,
        listeners,
        setNodeRef: draggableRef,
        setActivatorNodeRef,
        transform,
        transition
    } = useSortable({
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
              opacity: isDragging ? 0.4 : undefined,
              transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
              zIndex: 10000,
              transition
          }
        : undefined

    return hasDragHandle ? (
        <HandleContextInst.Provider value={context}>
            <div
                ref={draggableRef}
                style={style}
                className={cx(className, isOver ? 'dnd-over-mask' : undefined)}
            >
                {children}
            </div>
        </HandleContextInst.Provider>
    ) : (
        <div
            ref={draggableRef}
            style={style}
            className={cx(className, isOver ? 'dnd-over-mask' : undefined)}
            {...attributes}
            {...listeners}
        >
            {children}
        </div>
    )
}

export default Sortable
