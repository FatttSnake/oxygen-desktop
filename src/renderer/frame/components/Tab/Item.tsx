import { PropsWithChildren } from 'react'
import Icon from '@ant-design/icons'
import useStyles from '#/assets/css/components/tab/item.style'

interface TabItemProps {
    icon?: string
    persistent?: boolean
    active?: boolean
    onClick?: () => void
    onClose?: () => void
}

const Item = ({
    icon,
    persistent,
    active,
    children,
    onClick,
    onClose
}: PropsWithChildren<TabItemProps>) => {
    const { styles, cx } = useStyles()

    return (
        <>
            <div
                className={cx(
                    styles.root,
                    active ? styles.active : undefined,
                    active ? 'active' : undefined
                )}
                onClick={onClick}
            >
                <div className={styles.separateLeft} />
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
                <div className={styles.separateRight} />
            </div>
        </>
    )
}

export default Item
