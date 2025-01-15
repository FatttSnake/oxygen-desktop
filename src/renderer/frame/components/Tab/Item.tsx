import { PropsWithChildren } from 'react'
import Icon from '@ant-design/icons'
import useStyles from '#/assets/css/components/tab/item.style'

interface TabItemProps extends PropsWithChildren {
    icon?: string
    persistent?: boolean
    active?: boolean
    onClick?: () => void
    onClose?: () => void
}

const Item = ({ icon, persistent, active, children, onClick, onClose }: TabItemProps) => {
    const { styles, cx } = useStyles()

    return (
        <div
            className={cx(
                styles.root,
                active ? styles.active : undefined,
                active ? 'active' : undefined
            )}
            onClick={onClick}
        >
            <div className={styles.icon}>
                {icon ? (
                    <div className={'img'} style={{ maskImage: `url(${icon})` }} />
                ) : (
                    <Icon component={IconOxygenLoading} spin />
                )}
            </div>
            <span className={styles.title}>{children}</span>

            {!persistent && (
                <div className={styles.close} onClick={onClose}>
                    <Icon component={IconOxygenClose} />
                </div>
            )}
        </div>
    )
}

export default Item
