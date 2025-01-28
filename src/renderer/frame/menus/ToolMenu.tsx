import { getToolMenuItem } from '$/util/common'
import Sidebar from '$/components/Sidebar'

const ToolMenu = () => {
    const [toolMenuItem] = useState<ToolMenuItem[]>(getToolMenuItem)

    const handleOnClick = (path: string) => {
        return () => {
            console.log(path)
        }
    }

    return (
        <Sidebar>
            <Sidebar.Scroll>
                <Sidebar.ItemList>
                    {toolMenuItem.map((menuItem: ToolMenuItem) => (
                        <Sidebar.Item
                            key={`${menuItem.authorUsername}:${menuItem.toolId}`}
                            icon={menuItem.icon}
                            text={menuItem.toolName}
                            onClick={handleOnClick(`${menuItem.authorUsername}:${menuItem.toolId}`)}
                        />
                    ))}
                </Sidebar.ItemList>
            </Sidebar.Scroll>
        </Sidebar>
    )
}

export default ToolMenu
