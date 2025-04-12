import { PropsWithChildren, ReactNode } from 'react'
import useStyles from '$/assets/css/components/sidebar/index.style'
import Item from '$/components/Sidebar/Item'
import ItemList from '$/components/Sidebar/ItemList'
import Scroll from '$/components/Sidebar/Scroll'
import Separate from '$/components/Sidebar/Separate'
import Submenu from '$/components/Sidebar/Submenu'
import Group from '$/components/Sidebar/Group'

export const SidebarContext = createContext({ isCollapse: false })

interface SidebarProps {
    width?: string
    bottomFixed?: ReactNode
    onCollapseChange?: (isCollapse: boolean) => void
}

const Sidebar = (props: PropsWithChildren<SidebarProps>) => {
    const { styles, cx } = useStyles()
    const [isCollapse, setIsCollapse] = useState(true)

    useEffect(() => {
        oxygenApi.sidebar.collapse.get().then((value) => {
            setIsCollapse(value)
            props.onCollapseChange?.(value)
        })
        oxygenApi.sidebar.collapse.onUpdate((value) => {
            setIsCollapse(value)
            props.onCollapseChange?.(value)
        })

        return () => {
            oxygenApi.sidebar.collapse.offUpdate()
        }
    }, [])

    return (
        <SidebarContext.Provider value={{ isCollapse }}>
            <div
                className={cx(styles.root, isCollapse ? styles.collapse : '')}
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
Sidebar.Group = Group

export default Sidebar
