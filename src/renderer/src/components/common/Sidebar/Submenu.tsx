import { PropsWithChildren } from 'react'

interface SidebarSubmenuProps extends PropsWithChildren {
    submenuTop: number
    submenuLeft: number
}

const Submenu = (props: SidebarSubmenuProps) => {
    return (
        <ul
            className={'submenu'}
            style={{
                top: props.submenuTop,
                left: props.submenuLeft
            }}
        >
            <div className={'content'}>{props.children}</div>
        </ul>
    )
}

export default Submenu
