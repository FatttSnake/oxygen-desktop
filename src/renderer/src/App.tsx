import { theme } from 'antd'
import zh_CN from 'antd/locale/zh_CN'
import BaseStyles from '@/assets/css/base.style'
import CommonStyles from '@/assets/css/common.style'
import {
    COLOR_PRODUCTION,
    THEME_DARK,
    THEME_FOLLOW_SYSTEM,
    THEME_LIGHT
} from '@/constants/common.constants'
import { getRouter } from '@/router'
import { getThemeMode, init } from '@/util/common'
import FullscreenLoadingMask from '@/components/common/FullscreenLoadingMask'

export const AppContext = createContext({
    refreshRouter: () => {},
    isDarkMode: false
})

const App = () => {
    const [messageInstance, messageHolder] = message.useMessage()
    const [notificationInstance, notificationHolder] = notification.useNotification()
    const [modalInstance, modalHolder] = AntdModal.useModal()
    const [routerState, setRouterState] = useState(getRouter)
    const [themeMode, setThemeMode] = useState(getThemeMode())
    const [isSystemDarkMode, setIsSystemDarkMode] = useState(false)

    const getIsDark = () => {
        switch (themeMode) {
            case THEME_FOLLOW_SYSTEM:
                return isSystemDarkMode
            case THEME_LIGHT:
                return false
            case THEME_DARK:
                return true
        }
    }

    useEffect(() => {
        init(messageInstance, notificationInstance, modalInstance)

        const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)')
        setIsSystemDarkMode(darkThemeMq.matches)
        const darkThemeMqChangeListener = (ev: MediaQueryListEvent) => {
            setIsSystemDarkMode(ev.matches)
        }
        darkThemeMq.addEventListener('change', darkThemeMqChangeListener)

        const themeModeChangeListener = () => {
            setThemeMode(getThemeMode())
        }
        window.addEventListener('localStorageChange', themeModeChangeListener)

        return () => {
            darkThemeMq.removeEventListener('change', darkThemeMqChangeListener)
            window.removeEventListener('localStorageChange', themeModeChangeListener)
        }
    }, [])

    return (
        <AntdConfigProvider
            theme={{
                cssVar: true,
                algorithm: getIsDark() ? theme.darkAlgorithm : theme.defaultAlgorithm,
                token: {
                    colorPrimary: COLOR_PRODUCTION,
                    colorLinkHover: COLOR_PRODUCTION
                },
                components: {
                    Tree: {
                        colorBgContainer: 'transparent'
                    }
                }
            }}
            locale={zh_CN}
        >
            <BaseStyles />
            <CommonStyles />
            <AppContext.Provider
                value={{
                    refreshRouter: () => {
                        setRouterState(getRouter())
                    },
                    isDarkMode: getIsDark()
                }}
            >
                <Suspense fallback={<FullscreenLoadingMask />}>
                    <RouterProvider router={routerState} />
                </Suspense>
            </AppContext.Provider>
            {messageHolder}
            {notificationHolder}
            {modalHolder}
        </AntdConfigProvider>
    )
}

export default App
