import { getToolMenuItem } from '$/util/common'
import Sidebar from '#/components/Sidebar'

const ToolMenu = () => {
    const [toolMenuItem] = useState<ToolMenuItem[]>(getToolMenuItem)

    const handleOnClick = (path: string) => {
        return () => {
            console.log(path)
        }
    }

    return (
        <Sidebar>
            {toolMenuItem.map((menuItem: ToolMenuItem) => (
                <Sidebar.Item
                    icon={menuItem.icon}
                    onClick={handleOnClick(`${menuItem.authorUsername}:${menuItem.toolId}`)}
                >
                    {menuItem.toolName}
                </Sidebar.Item>
            ))}
        </Sidebar>
    )
}

export default ToolMenu
