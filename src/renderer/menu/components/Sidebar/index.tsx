import { PropsWithChildren, ReactNode } from 'react'
import useStyles from '%/assets/css/components/sidebar/index.style'
import { getSidebarCollapse } from '!/util/common'
import Scroll from '%/components/Sidebar/Scroll'
import Item from '%/components/Sidebar/Item'

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
                <div className={styles.content}>
                    <Scroll>
                        <ul className={styles.safeVerticalPadding}>{props.children}</ul>
                    </Scroll>
                </div>
                <div className={styles.content} style={{ flex: 'none' }}>
                    <ul>{props.bottomFixed}</ul>
                </div>
            </div>
        </SidebarContext.Provider>
    )
}

Sidebar.Item = Item

export default Sidebar
