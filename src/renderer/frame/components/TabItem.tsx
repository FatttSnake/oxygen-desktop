import { PropsWithChildren } from 'react'
import Icon from '@ant-design/icons'
import useStyles from '#/assets/css/components/tab-item.style'

interface TabItemProps extends PropsWithChildren {
    icon?: IconComponent | string
    pin?: boolean
    active?: boolean
    onClick?: () => void
    onClose?: () => void
}

const TabItem = ({ icon, pin, active, children, onClick, onClose }: TabItemProps) => {
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
                    typeof icon === 'string' ? (
                        <img src={`data:image/svg+xml;base64,${icon}`} alt={'icon'} />
                    ) : (
                        <Icon component={icon} />
                    )
                ) : (
                    <Icon component={IconOxygenLoading} spin />
                )}
            </div>
            <span className={styles.title}>{children}</span>

            {!pin && (
                <div className={styles.close} onClick={onClose}>
                    <Icon component={IconOxygenClose} />
                </div>
            )}
        </div>
    )
}

export default TabItem
