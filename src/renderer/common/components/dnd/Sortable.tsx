import { CSSProperties, PropsWithChildren } from 'react'
import { cx } from 'antd-style'
import { Data } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { HandleContext, HandleContextInst } from '$/components/dnd/HandleContext'

interface SortableProps {
    id: string
    data?: Data
    isOutOfOver?: boolean
    className?: string
    hasDragHandle?: boolean
    removeTabIndex?: boolean
    style?: CSSProperties
}

const Sortable = ({
    id,
    data,
    isOutOfOver,
    className,
    hasDragHandle,
    removeTabIndex,
    style: customStyle,
    children
}: PropsWithChildren<SortableProps>) => {
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
              transition,
              ...customStyle
          }
        : customStyle

    return hasDragHandle ? (
        <HandleContextInst.Provider value={context}>
            <div
                ref={draggableRef}
                style={style}
                className={cx(
                    className,
                    isDragging ? 'dnd-dragging' : undefined,
                    isOutOfOver ? 'dnd-out-of-over-mask' : undefined
                )}
            >
                {children}
            </div>
        </HandleContextInst.Provider>
    ) : (
        <div
            ref={draggableRef}
            style={style}
            className={cx(
                className,
                isDragging ? 'dnd-dragging' : undefined,
                isOutOfOver ? 'dnd-out-of-over-mask' : undefined
            )}
            {...attributes}
            {...listeners}
            {...(removeTabIndex ? { tabIndex: undefined } : undefined)}
        >
            {children}
        </div>
    )
}

export default Sortable
