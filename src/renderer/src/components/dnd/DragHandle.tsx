import { HandleContextInst } from '@/components/dnd/HandleContext'
import Icon from '@ant-design/icons'
import '@/assets/css/components/dnd/drag-handle.scss'

interface DragHandleProps {
    padding?: string | number
}

const DragHandle = ({ padding }: DragHandleProps) => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { attributes, listeners, ref } = useContext(HandleContextInst)

    return (
        <button
            data-component={'component-drag-handle'}
            style={{ padding }}
            ref={ref}
            className={'drag-handle'}
            {...attributes}
            {...listeners}
        >
            <Icon component={IconOxygenHandle} />
        </button>
    )
}

export default DragHandle
