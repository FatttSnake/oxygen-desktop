import { PropsWithChildren } from 'react'
import useStyles from '$/assets/css/components/sidebar/submenu.style'
import { ItemContext } from '$/components/Sidebar/Item'

export const SubmenuContext = createContext({ isInSubmenu: false })

interface SidebarSubmenuProps extends PropsWithChildren {
    submenuTop: number
    submenuLeft: number
}

const Submenu = (props: SidebarSubmenuProps) => {
    const { styles, cx } = useStyles()
    const { isHover } = useContext(ItemContext)

    return (
        <SubmenuContext.Provider value={{ isInSubmenu: true }}>
            <ul
                className={cx(styles.root, isHover ? styles.hoveredSubmenu : '')}
                style={{
                    top: props.submenuTop,
                    left: props.submenuLeft - 1
                }}
            >
                <div className={styles.content}>{props.children}</div>
            </ul>
        </SubmenuContext.Provider>
    )
}

export default Submenu
