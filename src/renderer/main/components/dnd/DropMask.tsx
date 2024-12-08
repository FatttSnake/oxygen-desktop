import Icon from '@ant-design/icons'
import useStyles from '@/assets/css/components/dnd/drop-mask.style'

const DropMask = () => {
    const { styles } = useStyles()

    return (
        <div className={styles.root}>
            <div className={styles.dropMaskBorder}>
                <Icon component={IconOxygenReceive} />
            </div>
        </div>
    )
}

export default DropMask
