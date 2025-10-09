import { getToolMenuItem } from '$/util/tool'
import { navigateToView } from '$/util/navigation'
import Sidebar from '$/components/Sidebar'

const ToolMenu = () => {
    const [toolMenuItem, setToolMenuItem] = useState<ToolMenuItem[]>(getToolMenuItem)

    const handleOnClick = ({ authorUsername, toolId, platform, ver }: ToolMenuItem) => {
        return () => {
            navigateToView(
                authorUsername,
                toolId,
                platform,
                ver === 'local' ? '' : ver,
                ver === 'local'
            )
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
