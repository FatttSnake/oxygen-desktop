import { ReactNode } from 'react'
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
import useStyles from '#/assets/css/components/tab-list.style'
import HideScrollbar from '$/components/HideScrollbar'
import Droppable from '$/components/dnd/Droppable'
import Sortable from '$/components/dnd/Sortable'
import DraggableOverlay from '$/components/dnd/DraggableOverlay'
import TabItem from '#/components/TabItem'
import TabSeparate from '#/components/TabSeparate'

export interface Tab {
    key: string
    icon?: string
    title: ReactNode
    pin?: boolean
}

interface TabListProps {
    tabs: Tab[]
    activeTab?: string
    onActiveTabChange?: (tab?: Tab) => void
    onTabClose?: (tab: Tab) => void
    onTabsChange?: (tabs: Tab[]) => void
    onIndependentTab?: (tab: Tab) => void
}

const TabList = ({
    tabs,
    activeTab,
    onActiveTabChange,
    onTabClose,
    onTabsChange,
    onIndependentTab
}: TabListProps) => {
    const { styles } = useStyles()
    const [independentItem, setIndependentItem] = useState<string>()
    const [activeItem, setActiveItem] = useState<Tab>()
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
        setActiveItem(active.data.current as Tab)
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
            onIndependentTab?.(active.data.current as Tab)
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
                    <TabSeparate />
                    {tabs
                        .filter(({ pin }) => pin)
                        ?.map((tab) => (
                            <>
                                <TabItem
                                    icon={tab.icon}
                                    active={tab.key === activeTab}
                                    onClick={() => {
                                        onActiveTabChange?.(tab)
                                    }}
                                    pin
                                >
                                    {tab.title}
                                </TabItem>
                                <TabSeparate />
                            </>
                        ))}
                    <Droppable id={'tab'} className={styles.droppable}>
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
                                            <TabItem
                                                icon={tab.icon}
                                                active={tab.key === activeTab}
                                                onClick={() => {
                                                    onActiveTabChange?.(tab)
                                                }}
                                                onClose={() => {
                                                    onTabClose?.(tab)
                                                }}
                                            >
                                                {tab.title}
                                            </TabItem>
                                        </Sortable>
                                        <TabSeparate key={`${tab.key}-`} />
                                    </>
                                ))}
                        </SortableContext>
                        <DraggableOverlay>
                            {activeItem && (
                                <>
                                    <TabItem>{activeItem.title}</TabItem>
                                    <TabSeparate />
                                </>
                            )}
                        </DraggableOverlay>
                    </Droppable>
                </DndContext>
            </div>
        </HideScrollbar>
    )
}

export default TabList
