import Icon from '@ant-design/icons'
import useStyles from '#/assets/css/title-bar.style'
import TabList, { Tab } from '#/components/TabList'

const TitleBar = () => {
    const { styles, cx } = useStyles()
    const { x } = navigator.windowControlsOverlay!.getTitlebarAreaRect()
    const [isCollapse, setIsCollapse] = useState(oxygenApi.sidebar.collapse.get())
    const [activeTab, setActiveTab] = useState<string>()

    const [tabs, setTabs] = useState<Tab[]>([])

    const handleOnClickExpand = () => {
        oxygenApi.sidebar.collapse.update(!isCollapse)
        setIsCollapse(!isCollapse)
    }

    const handleOnActiveTabChange = (tab?: Tab) => {
        tab && oxygenApi.window.tab.switch(tab.key)
        tab && setActiveTab(tab.key)
    }

    const handleOnTabClose = (tab: Tab) => {
        oxygenApi.window.tab.close(tab.key)
    }

    const handleOnTabsChange = (tabs: Tab[]) => {
        setTabs(tabs)
        oxygenApi.window.tab.update(tabs)
    }

    const handleOnIndependentTab = (tab: Tab) => {
        oxygenApi.window.tab.independent(tab.key)
        oxygenApi.window.tab.create('')
    }

    useEffect(() => {
        oxygenApi.window.tab.list().then((tabs) => setTabs(tabs))
        oxygenApi.window.tab.onUpdate((tabs) => {
            setTabs(tabs)
        })
        oxygenApi.window.tab.onSwitch((key) => setActiveTab(key))
        oxygenApi.window.tab.create('')
    }, [])

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
