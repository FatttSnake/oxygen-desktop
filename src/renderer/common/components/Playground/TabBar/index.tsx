import useStyles from '$/assets/css/components/playground/tab-bar/tab-bar.style'
import HideScrollbar, { HideScrollbarElement } from '$/components/HideScrollbar'
import FlexBox from '$/components/FlexBox'
import Tab from '$/components/Playground/TabBar/Tab'

export interface TabItemProps {
    key: string
    name: string
    closable: boolean
    editable: boolean
}

interface TabBarProps {
    tabs: TabItemProps[]
    selectedTabKey?: string
    creatable?: boolean
    onChange?: (tabKey: string) => boolean
    onAddTab?: (tabName: string) => boolean
    onChangeTabName?: (tabKey: string, newTabName: string) => boolean
    onCloseTab?: (tabKey: string) => boolean
}

const TabBar = ({
    tabs = [],
    selectedTabKey,
    creatable = true,
    onChange,
    onAddTab,
    onChangeTabName,
    onCloseTab
}: TabBarProps) => {
    const { styles } = useStyles()
    const hideScrollbarRef = useRef<HideScrollbarElement>(null)
    const [editingTabKey, setEditingTabKey] = useState<string>()
    const [isCreating, setIsCreating] = useState(false)

    const handleOnClickTab = (tabKey: string) => {
        if (editingTabKey || isCreating) {
            return
        }

        onChange?.(tabKey)
    }

    const handleOnChangeTabName = (tabKey: string, newTabName: string): boolean => {
        const target = tabs.find((item) => item.key == tabKey)
        if (!target) {
            setEditingTabKey(undefined)
            return false
        }

        if (target.name === newTabName) {
            setEditingTabKey(undefined)
            return true
        }

        if (onChangeTabName?.(tabKey, newTabName) ?? true) {
            setEditingTabKey(undefined)
            return true
        }

        return false
    }

    const handleOnClickAdd = () => {
        if (editingTabKey || isCreating) {
            return
        }

        setIsCreating(true)
        setTimeout(() => {
            hideScrollbarRef.current?.scrollRight(1000)
        })
    }

    const handleOnAddTab = (newFileName: string): boolean => {
        if (!newFileName.trim().length) {
            setIsCreating(false)
            return false
        }
        if (onAddTab?.(newFileName) ?? true) {
            setIsCreating(false)
            return true
        }

        return false
    }

    return (
        <div className={styles.root}>
            <HideScrollbar
                ref={hideScrollbarRef}
                autoHideWaitingTime={800}
                scrollbarWidth={1}
                scrollbarAsidePadding={0}
                scrollbarEdgePadding={0}
            >
                <FlexBox direction={'horizontal'} className={styles.tabContent}>
                    {tabs.map((tab) => (
                        <Tab
                            key={tab.key}
                            value={tab.name}
                            active={!isCreating && selectedTabKey === tab.key}
                            closable={tab.closable}
                            editable={tab.editable}
                            editing={editingTabKey === tab.key}
                            onClick={() => handleOnClickTab(tab.key)}
                            onClose={() => onCloseTab?.(tab.key)}
                            onEditing={() => setEditingTabKey(tab.key)}
                            onRename={(newValue) => handleOnChangeTabName(tab.key, newValue)}
                            onCancel={() => setEditingTabKey(undefined)}
                        />
                    ))}
                    {creatable &&
                        (isCreating ? (
                            <Tab
                                key={'newTab'}
                                value={''}
                                active
                                closable={false}
                                editable
                                editing
                                onRename={handleOnAddTab}
                                onCancel={() => setIsCreating(false)}
                            />
                        ) : (
                            <Tab
                                key={'addTab'}
                                className={styles.tabItemAdd}
                                value={'+'}
                                closable={false}
                                onClick={handleOnClickAdd}
                            />
                        ))}
                    <div className={styles.tabsMarginRight}>
                        <div />
                    </div>
                </FlexBox>
            </HideScrollbar>
        </div>
    )
}

export default TabBar
