import Icon from '@ant-design/icons'
import styles from '@/assets/css/components/dnd/drop-mask.module.less'

const DropMask = () => {
    return (
        <div className={styles.root}>
            <div className={styles.dropMaskBorder}>
                <Icon component={IconOxygenReceive} />
            </div>
        </div>
    )
}

export default DropMask
