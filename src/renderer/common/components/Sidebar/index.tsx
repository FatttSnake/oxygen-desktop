import { PropsWithChildren, ReactNode } from 'react'
import useStyles from '$/assets/css/cpmponents/sidebar/index.style'
import { getSidebarCollapse } from '$/util/common'
import Item from '$/components/Sidebar/Item'
import ItemList from '$/components/Sidebar/ItemList'
import Scroll from '$/components/Sidebar/Scroll'
import Separate from '$/components/Sidebar/Separate'
import Submenu from '$/components/Sidebar/Submenu'

export const SidebarContext = createContext({ isCollapse: false })

interface SidebarProps extends PropsWithChildren {
    width?: string
    bottomFixed?: ReactNode
}

const Sidebar = (props: SidebarProps) => {
    const { styles, cx } = useStyles()
    const [isCollapseSidebar] = useState(getSidebarCollapse())

    return (
        <SidebarContext.Provider value={{ isCollapse: isCollapseSidebar }}>
            <div
                className={cx(styles.sidebar, isCollapseSidebar ? styles.collapse : '')}
                style={{ width: props.width ?? 'clamp(180px, 20vw, 240px)' }}
            >
                <div className={styles.content}>{props.children}</div>
                <div className={styles.content} style={{ flex: 'none' }}>
                    {props.bottomFixed}
                </div>
            </div>
        </SidebarContext.Provider>
    )
}

Sidebar.Item = Item
Sidebar.ItemList = ItemList
Sidebar.Scroll = Scroll
Sidebar.Separate = Separate
Sidebar.Submenu = Submenu

export default Sidebar
