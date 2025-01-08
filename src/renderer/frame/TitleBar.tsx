import Icon from '@ant-design/icons'
import useStyles from '#/assets/css/title-bar.style'
import { randomInt } from '$/util/common'
import TabList, { Tab } from '#/components/TabList'

const TitleBar = () => {
    const { styles, cx } = useStyles()
    const { x } = navigator.windowControlsOverlay!.getTitlebarAreaRect()
    const [isCollapse, setIsCollapse] = useState(false)
    const [activeTab, setActiveTab] = useState<string>()

    const [tabs, setTabs] = useState<Tab[]>([])

    const handleOnClickExpand = () => {
        setIsCollapse(!isCollapse)
        oxygenApi.createNewTab(randomInt(0, 10).toString())
    }

    const handleOnActiveTabChange = (tab?: Tab) => {
        tab && oxygenApi.switchTab(tab.key)
        tab && setActiveTab(tab.key)
    }

    const handleOnTabClose = (tab: Tab) => {
        oxygenApi.closeTab(tab.key)
    }

    const handleOnTabsChange = (tabs: Tab[]) => {
        setTabs(tabs)
        oxygenApi.updateTabs(tabs)
    }

    const handleOnIndependentTab = (tab: Tab) => {
        oxygenApi.independentTab(tab.key)
    }

    useEffect(() => {
        oxygenApi.listTabs().then((tabs) => setTabs(tabs))
        oxygenApi.onUpdateTab((tabs) => setTabs(tabs))
        oxygenApi.onSwitchTab((key) => setActiveTab(key))
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
