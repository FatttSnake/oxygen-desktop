import Icon from '@ant-design/icons'
import useStyles from '#/assets/css/title-bar.style'
import { getAvatar, getLoginStatus, getNickname, getVerifyStatus_async } from '$/util/auth'
import Tab from '#/components/Tab'

const TitleBar = () => {
    const { styles, cx, theme } = useStyles()
    const { x } = navigator.windowControlsOverlay!.getTitlebarAreaRect()
    const [isCollapse, setIsCollapse] = useState(false)
    const [activeTab, setActiveTab] = useState<string>()
    const [isLogin, setIsLogin] = useState(getLoginStatus)
    const [nickname, setNickname] = useState('')
    const [avatar, setAvatar] = useState('')

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

    const handleOnClickUser = () => {
        if (isLogin && getVerifyStatus_async() == true) {
            /* empty */
        } else {
            oxygenApi.window.tab.create('sign')
        }
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
        if (!tabs.some(({ key }) => key === 'coreView')) {
            oxygenApi.window.tab.create('core')
        }
        if (isLogin) {
            getNickname().then(setNickname)
            getAvatar().then(setAvatar)
        }
        oxygenApi.account.userInfo.onUpdate(() => {
            setIsLogin(getLoginStatus)
            if (getLoginStatus()) {
                getNickname().then(setNickname)
                getAvatar().then(setAvatar)
            }
        })
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

                <span
                    className={styles.avatar}
                    title={isLogin ? nickname : '登录'}
                    onClick={handleOnClickUser}
                >
                    {isLogin ? (
                        <img src={`data:image/png;base64,${avatar}`} alt={''} />
                    ) : (
                        <Icon viewBox={'-20 0 1024 1024'} component={IconOxygenUser} />
                    )}
                </span>
                <button className={cx(styles.btn, styles.settings)} onClick={handleOnClickSettings}>
                    <Icon component={IconOxygenSetting} />
                </button>
            </div>
            <div className={styles.titleBarRight} />
        </div>
    )
}

export default TitleBar
