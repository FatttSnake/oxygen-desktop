import {
    DndContext,
    DragOverEvent,
    DragStartEvent,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core'
import { DragEndEvent } from '@dnd-kit/core/dist/types'
import { arrayMove, SortableContext } from '@dnd-kit/sortable'
import useStyles from '#/assets/css/components/tab/list.style'
import HideScrollbar from '$/components/HideScrollbar'
import Droppable from '$/components/dnd/Droppable'
import Sortable from '$/components/dnd/Sortable'
import DraggableOverlay from '$/components/dnd/DraggableOverlay'
import Item from '#/components/Tab/Item'
import Separate from '#/components/Tab/Separate'

interface TabListProps {
    tabs: TabInstance[]
    activeTab?: string
    onActiveTabChange?: (tab?: TabInstance) => void
    onTabClose?: (tab: TabInstance) => void
    onTabsChange?: (tabs: TabInstance[]) => void
    onIndependentTab?: (tab: TabInstance) => void
}

const List = ({
    tabs,
    activeTab,
    onActiveTabChange,
    onTabClose,
    onTabsChange,
    onIndependentTab
}: TabListProps) => {
    const { styles } = useStyles()
    const [independentItem, setIndependentItem] = useState<string>()
    const [activeItem, setActiveItem] = useState<TabInstance>()
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10
            }
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5
            }
        })
    )

    const handleOnDragStart = ({ active }: DragStartEvent) => {
        setActiveItem(active.data.current as TabInstance)
    }

    const handleOnDragOver = ({ active, over }: DragOverEvent) => {
        setIndependentItem(over === null ? (active.id as string) : undefined)
    }

    const handleOnDragEnd = ({ active, over }: DragEndEvent) => {
        if (over && active.id !== over.id) {
            const activeIndex = tabs.findIndex((tab) => tab.key === active.id)
            const overIndex = tabs.findIndex((tab) => tab.key === over.id)
            onTabsChange?.(arrayMove(tabs, activeIndex, overIndex))
        }

        if (!over) {
            onIndependentTab?.(active.data.current as TabInstance)
        }

        setActiveItem(undefined)
        setIndependentItem(undefined)
    }

    const handleOnDragCancel = () => {
        setActiveItem(undefined)
        setIndependentItem(undefined)
    }

    useEffect(() => {
        if (!tabs.some(({ key }) => key === activeTab)) {
            onActiveTabChange?.(tabs.findLast(({ pin }) => pin) ?? tabs[tabs.length - 1])
        }
    }, [tabs, activeTab])

    return (
        <HideScrollbar isShowVerticalScrollbar={false}>
            <div className={styles.root}>
                <DndContext
                    sensors={sensors}
                    onDragStart={handleOnDragStart}
                    onDragOver={handleOnDragOver}
                    onDragEnd={handleOnDragEnd}
                    onDragCancel={handleOnDragCancel}
                >
                    <Separate key={'-'} />
                    {tabs
                        .filter(({ pin }) => pin)
                        ?.map((tab) => (
                            <>
                                <Item
                                    key={tab.key}
                                    icon={tab.icon}
                                    persistent={tab.persistent}
                                    active={tab.key === activeTab}
                                    onClick={() => {
                                        onActiveTabChange?.(tab)
                                    }}
                                    onClose={() => {
                                        onTabClose?.(tab)
                                    }}
                                >
                                    {tab.title}
                                </Item>
                                <Separate key={`${tab.key}-`} />
                            </>
                        ))}
                    <Droppable key={'tab'} id={'tab'} className={styles.droppable}>
                        <SortableContext
                            items={tabs.filter(({ pin }) => !pin).map((tab) => tab.key)}
                        >
                            {tabs
                                .filter(({ pin }) => !pin)
                                .map((tab) => (
                                    <>
                                        <Sortable
                                            key={tab.key}
                                            id={tab.key}
                                            data={tab}
                                            isOver={independentItem === tab.key}
                                            className={styles.sortable}
                                        >
                                            <Item
                                                icon={tab.icon}
                                                persistent={tab.persistent}
                                                active={tab.key === activeTab}
                                                onClick={() => {
                                                    onActiveTabChange?.(tab)
                                                }}
                                                onClose={() => {
                                                    onTabClose?.(tab)
                                                }}
                                            >
                                                {tab.title}
                                            </Item>
                                        </Sortable>
                                        <Separate key={`${tab.key}-`} />
                                    </>
                                ))}
                        </SortableContext>
                        <DraggableOverlay>
                            {activeItem && <Item>{activeItem.title}</Item>}
                        </DraggableOverlay>
                    </Droppable>
                </DndContext>
            </div>
        </HideScrollbar>
    )
}

export default List
