import { Theme } from 'antd-style'
import logo from '$/assets/logo.svg?raw'
import removeOutdatedCssCode from '$/assets/template/playground/removeOutdatedCss.js?raw'
import setupGlobalJsVariablesCode from '$/assets/template/playground/setupGlobalJsVariables.js?raw'
import setupGlobalCssVariablesCode from '$/assets/template/playground/setupGlobalCssVariables.js?raw'
import {
    convertObjToJsLiteral,
    generateThemeCssVariables,
    processBaseDist,
    removeUselessAttributes
} from '$/util/tool'

export const usePreview = (
    theme: Omit<Theme, 'prefixCls'>,
    isDarkMode: boolean,
    name?: string,
    icon?: string,
    dist?: string,
    base?: ToolBaseVo
) => {
    const themeRef = useRef(theme)
    const isDarkModeRef = useRef(isDarkMode)
    const previewViewIdRef = useRef<string>()
    const [previewViewId, setPreviewViewId] = useState<string>()

    const openPreview = () => {
        if (previewViewId) {
            void oxygenApi.window.tab.switch(previewViewId)
            return
        }
        oxygenApi.window.tab.create('tool').then(setPreviewViewId)
    }

    const openDevTools = () => {
        previewViewId && void oxygenApi.tool.view.devtools(previewViewId)
    }

    useEffect(() => {
        if (!previewViewId || !dist) {
            return
        }

        ;(base
            ? processBaseDist(base.id, base.version, {}).then(
                  ({ toolBaseVo }) => toolBaseVo.dist.fileContent
              )
            : (async () => '')()
        ).then((baseDist) => {
            oxygenApi.window.tab.icon(
                previewViewId,
                icon || `data:image/svg+xml;base64,${btoa(logo)}`
            )
            oxygenApi.window.tab.title(previewViewId, `[预览] ${name}`)
            oxygenApi.tool.view.render(removeOutdatedCssCode, previewViewId)
            oxygenApi.tool.view.render(
                setupGlobalJsVariablesCode.replace(
                    "'${replace_with_code}'",
                    convertObjToJsLiteral({
                        OxygenTheme: {
                            ...removeUselessAttributes(themeRef.current),
                            isDarkMode: isDarkModeRef.current
                        }
                    })
                ),
                previewViewId
            )
            oxygenApi.tool.view.render(
                setupGlobalCssVariablesCode.replace(
                    "'${replace_with_code}'",
                    convertObjToJsLiteral(generateThemeCssVariables(themeRef.current).styles)
                ),
                previewViewId
            )
            oxygenApi.tool.view.render(
                `(() => {${dist}})();\n(() => {${baseDist}})();`,
                previewViewId
            )
        })
    }, [previewViewId, name, icon, dist, base])

    useEffect(() => {
        themeRef.current = theme
        isDarkModeRef.current = isDarkMode
    }, [theme, isDarkMode])

    useEffect(() => {
        previewViewIdRef.current = previewViewId
    }, [previewViewId])

    useEffect(() => {
        oxygenApi.window.tab.onClosed((viewId) => {
            setPreviewViewId((prevState) => (viewId === prevState ? undefined : prevState))
        })

        return () => {
            oxygenApi.window.tab.offClosed()
            const previewViewId = previewViewIdRef.current
            previewViewId && oxygenApi.window.tab.close(previewViewId)
        }
    }, [])

    return { isPreviewOpen: !!previewViewId, openPreview, openDevTools }
}
