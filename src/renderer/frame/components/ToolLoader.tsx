import { useTheme } from 'antd-style'
import setupGlobalJsVariablesCode from '$/assets/template/setupGlobalJsVariables.js?raw'
import setupGlobalCssVariablesCode from '$/assets/template/setupGlobalCssVariables.js?raw'
import { DATABASE_NO_RECORD_FOUND, DATABASE_SELECT_SUCCESS } from '$/constants/common.constants'
import { CommonContext } from '$/CommonFramework'
import {
    convertObjToJsLiteral,
    generateThemeCssVariables,
    message,
    removeUselessAttributes
} from '$/util/common'
import { getLoginStatus } from '$/util/auth'
import { n_tool_detail } from '$/services/native'
import { r_tool_detail } from '$/services/tool'
import { base64ToFiles, base64ToStr, IMPORT_MAP_FILE_NAME } from '$/components/Playground/files'
import { IImportMap } from '$/components/Playground/shared'
import compiler from '$/components/Playground/compiler'

const ToolLoader = () => {
    const _theme = useTheme()
    const { isDarkMode: _isDarkMode } = useContext(CommonContext)
    const themeRef = useRef(_theme)
    const isDarkModeRef = useRef(_isDarkMode)
    const [isLoading, setIsLoading] = useState(false)

    const errorMessage = (viewId: string, content: string) => {
        message
            .error({
                content,
                style: { transform: 'translateY(40px)' }
            })
            .then(() => {
                setTimeout(() => {
                    oxygenApi.window.tab.close(viewId)
                }, 300)
            })
    }

    const refreshGlobalVariables = (key?: string) => {
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
            key
        )
        oxygenApi.tool.view.render(
            setupGlobalCssVariablesCode.replace(
                "'${replace_with_code}'",
                convertObjToJsLiteral(generateThemeCssVariables(themeRef.current).styles)
            ),
            key
        )
    }

    const render = (
        viewId: string,
        icon: string,
        title: string,
        dist: string,
        baseDist: string
    ) => {
        oxygenApi.window.tab.icon(viewId, icon)
        oxygenApi.window.tab.title(viewId, title)
        refreshGlobalVariables(viewId)
        oxygenApi.tool.view.render(`(() => {${dist}})();\n(() => {${baseDist}})();`, viewId)
    }

    const compile = (viewId: string, toolVo: ToolVo, needCompile: boolean) => {
        if (needCompile) {
            try {
                const baseDist = base64ToStr(toolVo.base.dist.data!)
                const files = base64ToFiles(toolVo.source.data!)
                const importMap = JSON.parse(files[IMPORT_MAP_FILE_NAME].value) as IImportMap
                compiler
                    .compile(files, importMap, toolVo.entryPoint)
                    .then((result) => {
                        const output = result.outputFiles[0].text
                        render(
                            viewId,
                            `data:image/svg+xml;base64,${toolVo.icon}`,
                            toolVo.name,
                            output,
                            baseDist
                        )
                    })
                    .catch((reason) => {
                        void message.error({
                            content: `编译失败：${reason}`,
                            style: { transform: 'translateY(40px)' }
                        })
                    })
            } catch (e) {
                errorMessage(viewId, '载入工具失败')
            }
        } else {
            try {
                const baseDist = base64ToStr(toolVo.base.dist.data!)
                const dist = base64ToStr(toolVo.dist.data!)
                render(
                    viewId,
                    `data:image/svg+xml;base64,${toolVo.icon}`,
                    toolVo.name,
                    dist,
                    baseDist
                )
            } catch (e) {
                void message.error('载入工具失败')
            }
        }
    }

    const loadTool = (
        viewId: string,
        username: string,
        toolId: string,
        ver: string,
        platform: Platform,
        source?: string
    ) => {
        void message.loading({
            content: '加载中……',
            key: 'LOADING',
            duration: 0,
            style: { transform: 'translateY(40px)' }
        })
        if (source === 'local') {
            n_tool_detail(username, toolId, platform)
                .then((tool) => {
                    if (!tool) {
                        errorMessage(viewId, '未找到指定工具')
                        return
                    }
                    compile(viewId, tool, username === '!')
                })
                .finally(() => {
                    setIsLoading(false)
                    message.destroy('LOADING')
                })

            return
        }

        r_tool_detail(username, toolId, ver.length ? ver : 'latest', platform)
            .then((res) => {
                const response = res.data
                switch (response.code) {
                    case DATABASE_SELECT_SUCCESS:
                        compile(viewId, response.data!, username === '!')
                        break
                    case DATABASE_NO_RECORD_FOUND:
                        errorMessage(viewId, '未找到指定工具')
                        break
                    default:
                        errorMessage(viewId, '获取工具信息失败，请稍后重试')
                }
            })
            .finally(() => {
                setIsLoading(false)
                message.destroy('LOADING')
            })
    }

    useEffect(() => {
        themeRef.current = _theme
        isDarkModeRef.current = _isDarkMode
        refreshGlobalVariables()
    }, [_theme, _isDarkMode])

    useEffect(() => {
        oxygenApi.tool.view.onLoad(
            (
                username,
                toolId,
                ver = 'latest',
                platform = import.meta.env.VITE_PLATFORM,
                source
            ) => {
                if (isLoading) {
                    return
                }
                setIsLoading(true)

                oxygenApi.window.tab.create('tool').then((viewId) => {
                    if (!['WEB', 'DESKTOP', 'ANDROID'].includes(platform)) {
                        errorMessage(viewId, `不支持的平台：${platform}`)
                        return
                    }
                    if (username === '!' && !getLoginStatus()) {
                        errorMessage(viewId, '未登录')
                        return
                    }
                    username && toolId && loadTool(viewId, username, toolId, ver, platform, source)
                })
            }
        )

        return () => {
            oxygenApi.tool.view.offLoad()
        }
    }, [])

    return <></>
}

export default ToolLoader
