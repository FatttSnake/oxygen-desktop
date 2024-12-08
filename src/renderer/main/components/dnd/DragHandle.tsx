import { HandleContextInst } from '@/components/dnd/HandleContext'
import Icon from '@ant-design/icons'
import useStyles from '@/assets/css/components/dnd/drag-handle.style'

interface DragHandleProps {
    padding?: string | number
}

const DragHandle = ({ padding }: DragHandleProps) => {
    const { styles } = useStyles()
    const { attributes, listeners, ref } = useContext(HandleContextInst)

    return (
        <button
            className={styles.root}
            style={{ padding }}
            ref={ref}
            {...attributes}
            {...listeners}
        >
            <Icon component={IconOxygenHandle} />
        </button>
    )
}

export default DragHandle
