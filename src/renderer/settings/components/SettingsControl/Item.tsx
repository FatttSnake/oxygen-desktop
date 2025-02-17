import { PropsWithChildren, ReactNode } from 'react'
import useStyles from '%/assets/css/components/settings-control/item.style'
import Icon from '@ant-design/icons'

interface ItemProps extends PropsWithChildren {
    icon?: IconComponent
    name: ReactNode
    desc?: ReactNode
    onClick?: () => void
}

const Item = ({ icon, name, desc, children, onClick }: ItemProps) => {
    const { styles, cx } = useStyles()

    return (
        <div className={cx(styles.root, onClick ? styles.clickable : undefined)} onClick={onClick}>
            <div className={styles.label}>
                <Icon component={icon} className={styles.icon} />
                <div className={styles.text}>
                    <div className={styles.name}>{name}</div>
                    <div className={styles.desc}>{desc}</div>
                </div>
            </div>
            <div className={styles.content}>{children}</div>
        </div>
    )
}

export default Item
