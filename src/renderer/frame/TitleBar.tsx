import Icon from '@ant-design/icons'
import useStyles from '#/assets/css/title-bar.style'
import TabList, { Tab } from '#/components/TabList'

const TitleBar = () => {
    const { styles, cx } = useStyles()
    const { x } = navigator.windowControlsOverlay!.getTitlebarAreaRect()
    const [isCollapse, setIsCollapse] = useState(false)
    const [activeTab, setActiveTab] = useState<string>()

    const [tabs, setTabs] = useState<Tab[]>([
        { key: 'PinTab', title: 'PinTab', pin: true },
        { key: 'Tab1', title: 'tab1' },
        { key: 'Tab2', title: 'tab2' },
        { key: 'Tab3', title: 'tab3' },
        { key: 'Tab4', title: 'tab4' }
    ])

    const handleOnClickExpand = () => {
        setIsCollapse(!isCollapse)
    }

    const handleOnActiveTabChange = (tab: Tab) => {
        setActiveTab(tab.key)
    }

    const handleOnTabClose = (tab: Tab) => {
        setTabs((prev) => prev.filter((item) => item.key !== tab.key))
    }

    const handleOnTabsChange = (tabs: Tab[]) => {
        setTabs(tabs)
    }

    const handleOnIndependentTab = (tab: Tab) => {
        setTabs((prev) => prev.filter((item) => item.key !== tab.key))
    }

    return (
        <div className={styles.root}>
            <div className={styles.titleBarLeft} />
            <div className={styles.titleBarCenter}>
                <div className={styles.operation}>
                    {x === 0 && <Icon component={IconOxygenLogo} />}
                    <AntdButton size={'small'} onClick={handleOnClickExpand}>
                        <Icon
                            component={IconOxygenExpand}
                            className={cx(
                                styles.expandIcon,
                                isCollapse ? styles.collapse : undefined
                            )}
                        />
                    </AntdButton>
                </div>
                <div className={styles.tabs}>
                    <TabList
                        tabs={tabs}
                        activeTab={activeTab}
                        onActiveTabChange={handleOnActiveTabChange}
                        onTabClose={handleOnTabClose}
                        onTabsChange={handleOnTabsChange}
                        onIndependentTab={handleOnIndependentTab}
                    />
                </div>
            </div>
            <div className={styles.titleBarRight} />
        </div>
    )
}

export default TitleBar
