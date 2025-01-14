import { PropsWithChildren } from 'react'
import { theme } from 'antd'
import zh_CN from 'antd/locale/zh_CN'
import BaseStyles from '$/assets/css/base.style'
import CommonStyles from '$/assets/css/common.style'
import { COLOR_PRODUCTION } from '$/constants/common.constants'
import { setPageFavicon } from '$/util/common'

export const CommonContext = createContext({
    isDarkMode: false
})

const CommonFramework = ({ children }: PropsWithChildren) => {
    const [themeMode, setThemeMode] = useState<WindowTheme>('FOLLOW_SYSTEM')
    const [isSystemDarkMode, setIsSystemDarkMode] = useState(false)

    const getIsDark = () => {
        switch (themeMode) {
            case 'FOLLOW_SYSTEM':
                return isSystemDarkMode
            case 'LIGHT':
                return false
            case 'DARK':
                return true
        }
    }

    useEffect(() => {
        setPageFavicon()

        const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)')
        setIsSystemDarkMode(darkThemeMq.matches)
        const darkThemeMqChangeListener = (ev: MediaQueryListEvent) => {
            setIsSystemDarkMode(ev.matches)
        }
        darkThemeMq.addEventListener('change', darkThemeMqChangeListener)

        oxygenApi.window.theme.get().then((theme) => setThemeMode(theme))
        oxygenApi.window.theme.onUpdate((theme) => setThemeMode(theme))

        return () => {
            darkThemeMq.removeEventListener('change', darkThemeMqChangeListener)
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
            <CommonContext.Provider value={{ isDarkMode: getIsDark() }}>
                {children}
            </CommonContext.Provider>
        </AntdConfigProvider>
    )
}

export default CommonFramework
