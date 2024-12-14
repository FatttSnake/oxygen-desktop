import { PropsWithChildren } from 'react'
import { theme } from 'antd'
import zh_CN from 'antd/locale/zh_CN'
import BaseStyles from '$/assets/css/base.style'
import CommonStyles from '$/assets/css/common.style'
import {
    COLOR_PRODUCTION,
    THEME_DARK,
    THEME_FOLLOW_SYSTEM,
    THEME_LIGHT
} from '$/constants/common.constants'
import { getThemeMode } from '$/util/common'

export const CommonContext = createContext({
    isDarkMode: false
})

const CommonFramework = ({ children }: PropsWithChildren) => {
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
    })

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
