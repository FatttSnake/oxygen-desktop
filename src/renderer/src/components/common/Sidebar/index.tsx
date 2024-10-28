import { PropsWithChildren, ReactNode } from 'react'
import Icon from '@ant-design/icons'
import useStyles from '@/assets/css/components/common/sidebar/index.style'
import { getLocalStorage, setLocalStorage } from '@/util/browser'
import Item from '@/components/common/Sidebar/Item'
import ItemList from '@/components/common/Sidebar/ItemList'
import Scroll from '@/components/common/Sidebar/Scroll'
import Separate from '@/components/common/Sidebar/Separate'
import Submenu from '@/components/common/Sidebar/Submenu'
import Footer from '@/components/common/Sidebar/Footer'

export const SidebarContext = createContext({ isCollapse: false })

interface SidebarProps extends PropsWithChildren {
    title: string
    width?: string
    onSidebarSwitch?: (hidden: boolean) => void
    bottomFixed?: ReactNode
}

const Sidebar = (props: SidebarProps) => {
    const { styles, cx } = useStyles()
    const [isCollapseSidebar, setIsCollapseSidebar] = useState(
        getLocalStorage('COLLAPSE_SIDEBAR') === 'true'
    )

    const switchSidebar = () => {
        setLocalStorage('COLLAPSE_SIDEBAR', !isCollapseSidebar ? 'true' : 'false')
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
