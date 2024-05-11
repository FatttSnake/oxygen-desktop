import { ReactNode, MouseEvent } from 'react'
import Icon from '@ant-design/icons'
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
        <li className={'item'}>
            <div className={'menu-bt'} onMouseEnter={showSubmenu}>
                <NavLink
                    end={props.end}
                    to={props.path}
                    className={({ isActive, isPending }) =>
                        isPending ? 'pending' : isActive ? 'active' : ''
                    }
                >
                    {props.icon && (
                        <div className={'icon-box'}>
                            {typeof props.icon === 'string' ? (
                                <img
                                    className={'icon'}
                                    src={`data:image/svg+xml;base64,${props.icon}`}
                                    alt={'icon'}
                                />
                            ) : (
                                <Icon className={'icon'} component={props.icon} />
                            )}
                        </div>
                    )}
                    <span className={'text'}>{props.text}</span>
                    <div className={'extend'}>{props.extend}</div>
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
