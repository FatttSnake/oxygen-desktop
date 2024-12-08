import { PropsWithChildren, ReactNode } from 'react'
import Icon from '@ant-design/icons'
import useStyles from '!/assets/css/cpmponents/sidebar/index.style'
import { getSidebarCollapse, setSidebarCollapse } from '!/util/common'
import Item from '!/components/Sidebar/Item'
import ItemList from '!/components/Sidebar/ItemList'
import Scroll from '!/components/Sidebar/Scroll'
import Separate from '!/components/Sidebar/Separate'
import Submenu from '!/components/Sidebar/Submenu'
import Footer from '!/components/Sidebar/Footer'

export const SidebarContext = createContext({ isCollapse: false })

interface SidebarProps extends PropsWithChildren {
    title: string
    width?: string
    onSidebarSwitch?: (hidden: boolean) => void
    bottomFixed?: ReactNode
}

const Sidebar = (props: SidebarProps) => {
    const { styles, cx } = useStyles()
    const [isCollapseSidebar, setIsCollapseSidebar] = useState(getSidebarCollapse())

    const switchSidebar = () => {
        setSidebarCollapse(!isCollapseSidebar)
        setIsCollapseSidebar(!isCollapseSidebar)
        props.onSidebarSwitch?.(isCollapseSidebar)
    }

    return (
        <SidebarContext.Provider value={{ isCollapse: isCollapseSidebar }}>
            <div
                className={cx(styles.sidebar, isCollapseSidebar ? styles.collapse : '')}
                style={{ width: props.width ?? 'clamp(180px, 20vw, 240px)' }}
            >
                <div className={styles.title}>
                    <span className={styles.titleIcon} onClick={switchSidebar}>
                        <Icon component={IconOxygenExpand} />
                    </span>
                    <span className={styles.titleText}>{props.title}</span>
                </div>
                <Separate style={{ marginTop: 0 }} />
                <div className={styles.content}>{props.children}</div>
                <div className={styles.content} style={{ flex: 'none' }}>
                    {props.bottomFixed}
                </div>
                <Separate style={{ marginTop: 0, marginBottom: 0 }} />
                <Footer />
            </div>
        </SidebarContext.Provider>
    )
}

Sidebar.Item = Item
Sidebar.ItemList = ItemList
Sidebar.Scroll = Scroll
Sidebar.Separate = Separate
Sidebar.Submenu = Submenu
Sidebar.Footer = Footer

export default Sidebar
