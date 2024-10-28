import { theme } from 'antd'
import zh_CN from 'antd/locale/zh_CN'
import BaseStyles from '@/assets/css/base.style'
import CommonStyles from '@/assets/css/common.style'
import { COLOR_PRODUCTION } from '@/constants/common.constants'
import { getRouter } from '@/router'
import { init } from '@/util/common'
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
    const [isDarkMode, setIsDarkMode] = useState(false)

    useEffect(() => {
        init(messageInstance, notificationInstance, modalInstance)
        const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)')
        setIsDarkMode(darkThemeMq.matches)
        const listener = (ev: MediaQueryListEvent) => {
            setIsDarkMode(ev.matches)
        }
        darkThemeMq.addEventListener('change', listener)

        return () => {
            darkThemeMq.removeEventListener('change', listener)
        }
    }, [])

    return (
        <AntdConfigProvider
            theme={{
                cssVar: true,
                algorithm: isDarkMode ? theme.darkAlgorithm : undefined,
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
                    isDarkMode
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
