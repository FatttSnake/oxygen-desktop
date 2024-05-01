import { DetailedHTMLProps, HTMLAttributes } from 'react'
import { useDroppable } from '@dnd-kit/core'

interface DroppableProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    id: string
}

const Droppable = ({ id, ...props }: DroppableProps) => {
    const { setNodeRef: droppableRef } = useDroppable({
        id
    })

    return <div {...props} ref={droppableRef} />
}

export default Droppable
