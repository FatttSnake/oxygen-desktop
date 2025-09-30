import {
    DndContext,
    DragOverEvent,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core'
import { DragEndEvent } from '@dnd-kit/core/dist/types'
import { arrayMove, SortableContext } from '@dnd-kit/sortable'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'
import useStyles from '#/assets/css/components/tab/list.style'
import HideScrollbar from '$/components/HideScrollbar'
import Droppable from '$/components/dnd/Droppable'
import Sortable from '$/components/dnd/Sortable'
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

        setIndependentItem(undefined)
    }

    const handleOnDragCancel = () => {
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
                <DndContext
                    sensors={sensors}
                    onDragOver={handleOnDragOver}
                    onDragEnd={handleOnDragEnd}
                    onDragCancel={handleOnDragCancel}
                    modifiers={[restrictToHorizontalAxis]}
                >
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
                                            removeTabIndex
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
                    </Droppable>
                </DndContext>
            </div>
        </HideScrollbar>
    )
}

export default List
