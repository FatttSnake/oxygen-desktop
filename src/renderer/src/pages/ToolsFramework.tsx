import { DndContext, DragOverEvent, DragStartEvent } from '@dnd-kit/core'
import Droppable from '@/components/dnd/Droppable'
import type { DragEndEvent } from '@dnd-kit/core/dist/types'
import '@/assets/css/pages/tools-framework.scss'
import { tools } from '@/router/tools'
import FitFullscreen from '@/components/common/FitFullscreen'
import Sidebar from '@/components/common/Sidebar'
import FullscreenLoadingMask from '@/components/common/FullscreenLoadingMask'
import { arrayMove, SortableContext } from '@dnd-kit/sortable'
import { getViewPath } from '@/util/navigation.tsx'
import Sortable from '@/components/dnd/Sortable.tsx'
import DragHandle from '@/components/dnd/DragHandle.tsx'
import DraggableOverlay from '@/components/dnd/DraggableOverlay.tsx'
import { getToolMenuItem, saveToolMenuItem } from '@/util/common.tsx'

const ToolsFramework = () => {
    const [isDelete, setIsDelete] = useState(false)
    const [toolMenuItem, setToolMenuItem] = useState<ToolMenuItem[]>(getToolMenuItem)
    const [activeItem, setActiveItem] = useState<ToolMenuItem | null>(null)

    const handleOnDragStart = ({ active }: DragStartEvent) => {
        setActiveItem(active.data.current as ToolMenuItem)
    }

    const handleOnDragOver = ({ over }: DragOverEvent) => {
        setIsDelete(over === null)
    }

    const handleOnDragEnd = ({ active, over }: DragEndEvent) => {
        if (over && active.id !== over?.id) {
            const activeIndex = toolMenuItem.findIndex(
                ({ authorUsername, toolId, ver }) =>
                    `${authorUsername}:${toolId}:${ver}` === active.id
            )
            const overIndex = toolMenuItem.findIndex(
                ({ authorUsername, toolId, ver }) =>
                    `${authorUsername}:${toolId}:${ver}` === over.id
            )
            setToolMenuItem(arrayMove(toolMenuItem, activeIndex, overIndex))
        }

        if (!over) {
            setToolMenuItem(
                toolMenuItem.filter(
                    ({ authorUsername, toolId, ver }) =>
                        `${authorUsername}:${toolId}:${ver}` !== active?.id
                )
            )
        }

        if (!active.data.current?.sortable && over) {
            const newItem = active.data.current as ToolMenuItem
            if (
                toolMenuItem.findIndex(
                    ({ authorUsername, toolId, ver }) =>
                        authorUsername === newItem.authorUsername &&
                        toolId === newItem.toolId &&
                        ver === newItem.ver
                ) === -1
            ) {
                setToolMenuItem([...toolMenuItem, newItem])
            }
        }

        console.log('active', active)
        console.log('over', over)

        setActiveItem(null)
    }

    const handleOnDragCancel = () => {
        setActiveItem(null)
    }

    useEffect(() => {
        saveToolMenuItem(toolMenuItem)
    }, [toolMenuItem])

    return (
        <>
            <FitFullscreen data-component={'tools-framework'} className={'flex-horizontal'}>
                <DndContext
                    onDragStart={handleOnDragStart}
                    onDragOver={handleOnDragOver}
                    onDragEnd={handleOnDragEnd}
                    onDragCancel={handleOnDragCancel}
                >
                    <div className={'left-panel'}>
                        <Sidebar title={'氧工具'}>
                            <Sidebar.ItemList>
                                <Sidebar.Item
                                    end
                                    path={'/store'}
                                    icon={tools[0].icon}
                                    text={tools[0].name}
                                />
                                <Sidebar.Item
                                    end
                                    path={'/repository'}
                                    icon={tools[1].icon}
                                    text={tools[1].name}
                                />
                            </Sidebar.ItemList>
                            <Sidebar.Separate />
                            <Droppable id={'menu'} className={'menu-droppable'}>
                                <Sidebar.Scroll>
                                    <Sidebar.ItemList>
                                        <SortableContext
                                            items={toolMenuItem.map(
                                                ({ authorUsername, toolId, ver }) =>
                                                    `${authorUsername}:${toolId}:${ver}`
                                            )}
                                        >
                                            {toolMenuItem.map(
                                                ({
                                                    icon,
                                                    toolName,
                                                    toolId,
                                                    authorUsername,
                                                    ver
                                                }) => (
                                                    <Sortable
                                                        id={`${authorUsername}:${toolId}:${ver}`}
                                                        data={{
                                                            icon,
                                                            toolName,
                                                            toolId,
                                                            authorUsername,
                                                            ver
                                                        }}
                                                        isDelete={isDelete}
                                                    >
                                                        <Sidebar.Item
                                                            path={getViewPath(
                                                                authorUsername,
                                                                toolId,
                                                                import.meta.env.VITE_PLATFORM,
                                                                ver
                                                            )}
                                                            icon={icon}
                                                            text={toolName}
                                                            key={`${authorUsername}:${toolId}`}
                                                            extend={<DragHandle padding={10} />}
                                                        />
                                                    </Sortable>
                                                )
                                            )}
                                        </SortableContext>
                                        <DraggableOverlay>
                                            {activeItem && (
                                                <Sidebar.Item
                                                    path={getViewPath(
                                                        activeItem.authorUsername,
                                                        activeItem.toolId,
                                                        import.meta.env.VITE_PLATFORM,
                                                        activeItem.ver
                                                    )}
                                                    icon={activeItem.icon}
                                                    text={activeItem.toolName}
                                                    key={`${activeItem.authorUsername}:${activeItem.toolId}:${activeItem.ver}`}
                                                    extend={<DragHandle padding={10} />}
                                                />
                                            )}
                                        </DraggableOverlay>
                                    </Sidebar.ItemList>
                                </Sidebar.Scroll>
                            </Droppable>
                        </Sidebar>
                    </div>
                    <div className={'right-panel'}>
                        <Suspense
                            fallback={
                                <>
                                    <FullscreenLoadingMask />
                                </>
                            }
                        >
                            <Outlet />
                        </Suspense>
                    </div>
                </DndContext>
            </FitFullscreen>
        </>
    )
}

export default ToolsFramework
