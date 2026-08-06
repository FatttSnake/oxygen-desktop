import Icon from '@ant-design/icons'
import useStyles from '#/assets/css/title-bar.style'
import { useReloadConfig } from '$/components/config/ConfigContext'
import { getAvatar, getLoginStatus, getNickname, getVerifyStatus } from '$/util/auth'
import { HideScrollbarElement } from '$/components/HideScrollbar'
import Tab from '#/components/Tab'
import { useConnectivityMode } from '#/hooks/useConnectivityMode.ts'

interface TitleBarProps {
    onShowMenuChange?: (visible: boolean) => void
}

const TitleBar = ({ onShowMenuChange }: TitleBarProps) => {
    const { styles, cx, theme } = useStyles()
    const { x } = navigator.windowControlsOverlay!.getTitlebarAreaRect()
    const tabListRef = useRef<HideScrollbarElement>(null)
    const [isCollapse, setIsCollapse] = useState(false)
    const [activeTab, setActiveTab] = useState<string>()
    const [isLogin, setIsLogin] = useState(getLoginStatus)
    const [nickname, setNickname] = useState('')
    const [avatar, setAvatar] = useState('')
    const [tabs, setTabs] = useState<TabInstance[]>([])
    const reloadConfig = useReloadConfig()
    const connectivityMode = useConnectivityMode()

    const handleOnClickExpand = () => {
        oxygenApi.sidebar.collapse.update(!isCollapse)
        setIsCollapse(!isCollapse)
    }

    const handleOnActiveTabChange = (tab?: TabInstance) => {
        tab && oxygenApi.window.tab.switch(tab.key)
        tab && setActiveTab(tab.key)
    }

    const handleOnTabClose = (tab: TabInstance) => {
        if (activeTab === tab.key) {
            const tabIndex = tabs.findIndex(({ key }) => key === tab.key)
            if (tabIndex > 0) {
                void oxygenApi.window.tab.switch(tabs[tabIndex - 1].key)
            }
        }
        oxygenApi.window.tab.close(tab.key)
    }

    const handleOnTabsChange = (tabs: TabInstance[]) => {
        setTabs(tabs)
        oxygenApi.window.tab.update(tabs)
    }

    const handleOnIndependentTab = (tab: TabInstance) => {
        oxygenApi.window.tab.independent(tab.key)
    }

    const handleOnClickUser = () => {
        if (connectivityMode !== 'online') {
            return
        }
        if (isLogin && getVerifyStatus() == true) {
            void oxygenApi.window.tab.create('settings', { navigateTo: '/base/account' })
        } else {
            void oxygenApi.window.tab.create('sign')
        }
    }

    const handleOnClickSettings = () => {
        void oxygenApi.window.tab.create('settings')
    }

    useEffect(() => {
        onShowMenuChange?.(tabs.find((tab) => tab.key === activeTab)?.pin === false)
    }, [tabs, activeTab])

    useEffect(() => {
        oxygenApi.window.titleBarOverlay.setColor(theme.colorBgContainer, theme.colorText)
    }, [theme])

    useEffect(() => {
        oxygenApi.sidebar.collapse.get().then((value) => setIsCollapse(value))
        oxygenApi.window.tab.list().then((tabs) => setTabs(tabs))
        oxygenApi.window.tab.onUpdate((tabs) => {
            setTabs((prevState) => {
                if (tabs.length > prevState.length) {
                    setTimeout(() => {
                        tabListRef.current?.scrollX(1e16)
                    }, 500)
                }
                return tabs
            })
        })
        oxygenApi.window.tab.onSwitch((key) => setActiveTab(key))
        if (!tabs.some(({ key }) => key === 'coreView')) {
            void oxygenApi.window.tab.create('core')
        }
        if (isLogin) {
            getNickname().then((nickname) => setNickname(nickname ?? ''))
            getAvatar().then((avatar) => setAvatar(avatar ?? ''))
        }
        oxygenApi.account.userInfo.onUpdate(() => {
            setIsLogin(getLoginStatus)
            if (getLoginStatus()) {
                getNickname().then((nickname) => setNickname(nickname ?? ''))
                getAvatar().then((avatar) => setAvatar(avatar ?? ''))
            }
        })

        return () => {
            oxygenApi.window.tab.offUpdate()
            oxygenApi.window.tab.offSwitch()
            oxygenApi.account.userInfo.offUpdate()
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
                        ref={tabListRef}
                        tabs={tabs}
                        activeTab={activeTab}
                        onActiveTabChange={handleOnActiveTabChange}
                        onTabClose={handleOnTabClose}
                        onTabsChange={handleOnTabsChange}
                        onIndependentTab={handleOnIndependentTab}
                    />
                </div>

                {connectivityMode === 'offline' && (
                    <button
                        className={cx(styles.btn, styles.offline)}
                        title={'点击重连'}
                        onClick={reloadConfig}
                    >
                        <Icon component={IconOxygenOffline} />
                        <span className={styles.offlineText}>离线模式</span>
                    </button>
                )}
                {connectivityMode === 'online' && (
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
                )}
                <button
                    className={cx(styles.btn, styles.settings)}
                    title={'设置'}
                    onClick={handleOnClickSettings}
                >
                    <Icon component={IconOxygenSetting} />
                </button>
            </div>
            <div className={styles.titleBarRight} />
        </div>
    )
}

export default TitleBar
