import { getToolMenuItem } from '$/util/tool'
import Sidebar from '$/components/Sidebar'

const ToolMenu = () => {
    const [toolMenuItem, setToolMenuItem] = useState<ToolMenuItem[]>(getToolMenuItem)

    const handleOnClick = (menuItem: ToolMenuItem) => {
        return () => {
            console.log(menuItem)
        }
    }

    useEffect(() => {
        oxygenApi.sidebar.menu.onUpdate(() => {
            setToolMenuItem(getToolMenuItem)
        })

        return () => {
            oxygenApi.sidebar.menu.offUpdate()
        }
    }, [])

    return toolMenuItem.length ? (
        <Sidebar>
            <Sidebar.Scroll>
                <Sidebar.ItemList>
                    {toolMenuItem.map((menuItem: ToolMenuItem) => (
                        <Sidebar.Item
                            key={`${menuItem.authorUsername}:${menuItem.toolId}`}
                            icon={menuItem.icon}
                            text={menuItem.toolName}
                            onClick={handleOnClick(menuItem)}
                        />
                    ))}
                </Sidebar.ItemList>
            </Sidebar.Scroll>
        </Sidebar>
    ) : undefined
}

export default ToolMenu
