import { ReactNode, MouseEvent } from 'react'
import Icon from '@ant-design/icons'
import styles from '@/assets/css/components/common/sidebar.module.less'
import Submenu from '@/components/common/Sidebar/Submenu'

type ItemProps = {
    icon?: IconComponent | string
    text?: string
    path: string
    children?: ReactNode
    extend?: ReactNode
    end?: boolean
}

const Item = (props: ItemProps) => {
    const [submenuTop, setSubmenuTop] = useState(Number.MAX_VALUE)
    const [submenuLeft, setSubmenuLeft] = useState(Number.MAX_VALUE)

    const showSubmenu = (e: MouseEvent) => {
        const parentElement = e.currentTarget.parentElement
        if (parentElement?.childElementCount === 2) {
            const parentClientRect = parentElement.getBoundingClientRect()
            if (parentClientRect.top <= screen.height / 2) {
                setSubmenuTop(parentClientRect.top)
            } else {
                setSubmenuTop(
                    parentClientRect.top -
                        (parentElement.lastElementChild?.clientHeight ?? 0) +
                        e.currentTarget.clientHeight
                )
            }
            setSubmenuLeft(parentClientRect.right)
        }
    }

    return (
        <li className={styles.item}>
            <div className={styles.menuBt} onMouseEnter={showSubmenu}>
                <NavLink
                    end={props.end}
                    to={props.path}
                    className={({ isActive, isPending }) =>
                        isPending ? 'pending' : isActive ? `${styles.active}` : ''
                    }
                >
                    {props.icon && (
                        <div className={styles.iconBox}>
                            {typeof props.icon === 'string' ? (
                                <img src={`data:image/svg+xml;base64,${props.icon}`} alt={'icon'} />
                            ) : (
                                <Icon component={props.icon} />
                            )}
                        </div>
                    )}
                    <span className={styles.text}>{props.text}</span>
                    <div className={styles.extend}>{props.extend}</div>
                </NavLink>
            </div>
            {props.children && (
                <Submenu submenuTop={submenuTop} submenuLeft={submenuLeft}>
                    {props.children}
                </Submenu>
            )}
        </li>
    )
}

export default Item
