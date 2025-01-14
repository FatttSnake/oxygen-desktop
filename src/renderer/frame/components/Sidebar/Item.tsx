import { ReactNode } from 'react'
import Icon from '@ant-design/icons'
import useStyles from '#/assets/css/components/sidebar/item.style'
import { SidebarContext } from '#/components/Sidebar/index'

interface ItemProps {
    icon: IconComponent | string
    children?: ReactNode
    isActive?: boolean
    onClick?: () => void
}

const Item = ({ icon, children, isActive, onClick }: ItemProps) => {
    const { styles, cx } = useStyles()
    const { isCollapse } = useContext(SidebarContext)

    return (
        <li className={styles.item}>
            <div
                className={cx(styles.menuBt, isActive ? styles.active : undefined)}
                onClick={onClick}
            >
                <div className={styles.icon}>
                    {typeof icon === 'string' ? (
                        <img src={`data:image/svg+xml;base64,${icon}`} alt={'icon'} />
                    ) : (
                        <Icon component={icon} />
                    )}
                </div>
                <span className={cx(styles.text, isCollapse ? styles.collapsedText : '')}>
                    {children}
                </span>
            </div>
        </li>
    )
}

export default Item
