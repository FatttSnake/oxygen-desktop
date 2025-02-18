import { PropsWithChildren, ReactNode } from 'react'
import Icon from '@ant-design/icons'
import '@/assets/css/components/common/sidebar.scss'
import { getLocalStorage, setLocalStorage } from '@/util/browser'
import Item from '@/components/common/Sidebar/Item'
import ItemList from '@/components/common/Sidebar/ItemList'
import Scroll from '@/components/common/Sidebar/Scroll'
import Separate from '@/components/common/Sidebar/Separate'
import Submenu from '@/components/common/Sidebar/Submenu'
import Footer from '@/components/common/Sidebar/Footer'

interface SidebarProps extends PropsWithChildren {
    title: string
    width?: string
    onSidebarSwitch?: (hidden: boolean) => void
    bottomFixed?: ReactNode
}

const Sidebar = (props: SidebarProps) => {
    const [hideSidebar, setHideSidebar] = useState(getLocalStorage('HIDE_SIDEBAR') === 'true')

    const switchSidebar = () => {
        setLocalStorage('HIDE_SIDEBAR', !hideSidebar ? 'true' : 'false')
        setHideSidebar(!hideSidebar)
        props.onSidebarSwitch?.(hideSidebar)
    }

    return (
        <>
            <div
                className={`sidebar${hideSidebar ? ' hide' : ''}`}
                style={{ width: props.width ?? 'clamp(180px, 20vw, 240px)' }}
            >
                <div className={'title'}>
                    <span className={'icon-box'} onClick={switchSidebar}>
                        <Icon component={IconOxygenExpand} />
                    </span>
                    <span className={'text'}>{props.title}</span>
                </div>
                <Separate style={{ marginTop: 0 }} />
                <div className={'content'}>{props.children}</div>
                <div className={'bottom-fixed'} style={{ flex: 'none' }}>
                    {props.bottomFixed}
                </div>
                <Separate style={{ marginTop: 0, marginBottom: 0 }} />
                <Footer />
            </div>
        </>
    )
}

Sidebar.Item = Item
Sidebar.ItemList = ItemList
Sidebar.Scroll = Scroll
Sidebar.Separate = Separate
Sidebar.Submenu = Submenu
Sidebar.Footer = Footer

export default Sidebar
