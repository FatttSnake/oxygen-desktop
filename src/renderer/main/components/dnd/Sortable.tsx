import { CSSProperties, PropsWithChildren } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import useStyles from '@/assets/css/components/dnd/sortable.style'
import { HandleContext, HandleContextInst } from '@/components/dnd/HandleContext'

interface SortableProps extends PropsWithChildren {
    id: string
    data: ToolMenuItem
    isDelete?: boolean
}

const Sortable = ({ id, data, isDelete, children }: SortableProps) => {
    const { styles } = useStyles()
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

    return (
        <HandleContextInst.Provider value={context}>
            <div
                ref={draggableRef}
                style={style}
                className={isDragging && isDelete ? styles.delete : undefined}
            >
                {children}
            </div>
        </HandleContextInst.Provider>
    )
}

export default Sortable
