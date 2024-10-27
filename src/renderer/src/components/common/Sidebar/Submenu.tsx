import { PropsWithChildren } from 'react'
import styles from '@/assets/css/components/common/sidebar.module.less'

interface SidebarSubmenuProps extends PropsWithChildren {
    submenuTop: number
    submenuLeft: number
}

const Submenu = (props: SidebarSubmenuProps) => {
    return (
        <ul
            className={styles.submenu}
            style={{
                top: props.submenuTop,
                left: props.submenuLeft
            }}
        >
            <div className={styles.content}>{props.children}</div>
        </ul>
    )
}

export default Submenu
