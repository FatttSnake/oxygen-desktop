import Icon from '@ant-design/icons'
import useStyles from '#/assets/css/title-bar.style'
import Tab from '#/components/Tab'

const TitleBar = () => {
    const { styles, cx, theme } = useStyles()
    const { x } = navigator.windowControlsOverlay!.getTitlebarAreaRect()
    const [isCollapse, setIsCollapse] = useState(false)
    const [activeTab, setActiveTab] = useState<string>()

    const [tabs, setTabs] = useState<TabInstance[]>([])

    const handleOnClickExpand = () => {
        oxygenApi.sidebar.collapse.update(!isCollapse)
        setIsCollapse(!isCollapse)
        oxygenApi.window.tab.create('tool', { url: '' })
    }

    const handleOnActiveTabChange = (tab?: TabInstance) => {
        tab && oxygenApi.window.tab.switch(tab.key)
        tab && setActiveTab(tab.key)
    }

    const handleOnTabClose = (tab: TabInstance) => {
        oxygenApi.window.tab.close(tab.key)
    }

    const handleOnTabsChange = (tabs: TabInstance[]) => {
        setTabs(tabs)
        oxygenApi.window.tab.update(tabs)
    }

    const handleOnIndependentTab = (tab: TabInstance) => {
        oxygenApi.window.tab.independent(tab.key)
        oxygenApi.window.tab.create('tool', { url: '' })
    }

    const handleOnClickSettings = () => {
        oxygenApi.window.tab.create('settings')
    }

    useEffect(() => {
        oxygenApi.window.titleBarOverlay.setColor(theme.colorBgContainer, theme.colorText)
    }, [theme])

    useEffect(() => {
        oxygenApi.sidebar.collapse.get().then((value) => setIsCollapse(value))
        oxygenApi.window.tab.list().then((tabs) => setTabs(tabs))
        oxygenApi.window.tab.onUpdate((tabs) => {
            setTabs(tabs)
        })
        oxygenApi.window.tab.onSwitch((key) => setActiveTab(key))
        // oxygenApi.window.tab.create('')
        if (!tabs.some(({ key }) => key === 'mainView')) {
            oxygenApi.window.tab.create('main')
        }
    }, [])

    return (
        <div className={styles.root}>
            <div className={styles.titleBarLeft} />
            <div className={styles.titleBarCenter}>
                <div className={styles.operation}>
                    {x === 0 && <Icon component={IconOxygenLogo} />}
                    <button className={styles.btn} onClick={handleOnClickExpand}>
                        <Icon
                            component={IconOxygenExpand}
                            className={cx(
                                styles.expandIcon,
                                isCollapse ? styles.collapse : undefined
                            )}
                        />
                    </button>
                </div>
                <div className={styles.tabs}>
                    <Tab.List
                        tabs={tabs}
                        activeTab={activeTab}
                        onActiveTabChange={handleOnActiveTabChange}
                        onTabClose={handleOnTabClose}
                        onTabsChange={handleOnTabsChange}
                        onIndependentTab={handleOnIndependentTab}
                    />
                </div>

                <button className={cx(styles.btn, styles.settings)} onClick={handleOnClickSettings}>
                    <Icon component={IconOxygenSetting} />
                </button>
            </div>
            <div className={styles.titleBarRight} />
        </div>
    )
}

export default TitleBar
