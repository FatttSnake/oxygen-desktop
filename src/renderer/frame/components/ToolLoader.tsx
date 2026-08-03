import { useTheme } from 'antd-style'
import { AxiosResponse } from 'axios'
import setupGlobalJsVariablesCode from '$/assets/template/playground/setupGlobalJsVariables.js?raw'
import setupGlobalCssVariablesCode from '$/assets/template/playground/setupGlobalCssVariables.js?raw'
import { DATABASE_NO_RECORD_FOUND, DATABASE_SELECT_SUCCESS } from '$/constants/common.constants'
import { CommonContext } from '$/CommonFramework'
import { message } from '$/util/common'
import { getLoginStatus } from '$/util/auth'
import {
    convertObjToJsLiteral,
    generateThemeCssVariables,
    processBaseDist,
    removeUselessAttributes
} from '$/util/tool'
import { n_tool_get_one } from '$/services/native'
import { r_tool_get_dist, r_tool_get_source } from '$/services/tool'
import Compiler from '$/components/Playground/compiler'
import { getImportMap, sourceListToFileTree } from '$/components/Playground/files'

const ToolLoader = () => {
    const theme = useTheme()
    const { isDarkMode } = useContext(CommonContext)
    const themeRef = useRef(theme)
    const isDarkModeRef = useRef(isDarkMode)
    const [isLoading, setIsLoading] = useState(false)
    const isCompiled = useRef(false)
    const isMainWindow = oxygenApi.windowType === 'main'

    const errorMessage = (viewId: string, content: string) => {
        message
            .error({
                content,
                style: { transform: 'translateY(40px)' }
            })
            .then(() => {
                setTimeout(() => {
                    if (isMainWindow) {
                        oxygenApi.window.tab.close(viewId)
                    } else {
                        oxygenApi.window.base.close(viewId)
                    }
                }, 300)
            })
    }

    const refreshGlobalVariables = (key?: string) => {
        if (!isCompiled.current) {
            return
        }
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
        isCompiled.current = true
        oxygenApi.window.tab.icon(viewId, icon)
        oxygenApi.window.tab.title(viewId, title)
        refreshGlobalVariables(viewId)
        oxygenApi.tool.view.render(`(() => {${dist}})();\n(() => {${baseDist}})();`, viewId)
    }

    const compile = (
        viewId: string,
        toolVo: ToolWithSourceVo | ToolWithDistVo,
        toolBaseVo: ToolBaseWithDistVo,
        needCompile: boolean
    ) => {
        if (needCompile) {
            try {
                const baseDist = toolBaseVo.dist.fileContent
                const fileTree = sourceListToFileTree((toolVo as ToolWithSourceVo).sources)
                const importMap = getImportMap(fileTree)
                Compiler.compile(fileTree, importMap, toolVo.entryPoint)
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
                        errorMessage(viewId, `编译失败：${reason}`)
                    })
            } catch (e) {
                errorMessage(viewId, '载入工具失败')
            }
        } else {
            try {
                const baseDist = toolBaseVo.dist.fileContent
                const dist = (toolVo as ToolWithDistVo).dist.fileContent
                render(
                    viewId,
                    `data:image/svg+xml;base64,${toolVo.icon}`,
                    toolVo.name,
                    dist,
                    baseDist
                )
            } catch (e) {
                errorMessage(viewId, '载入工具失败')
            }
        }
    }

    const loadTool = (
        viewId: string,
        username: string,
        toolId: string,
        platform: Platform,
        ver: string,
        source?: string
    ) => {
        void message.loading({
            content: '加载中……',
            key: 'LOADING',
            duration: 0,
            style: { transform: 'translateY(40px)' }
        })
        if (source === 'local') {
            n_tool_get_one(username, toolId, platform)
                .then((tool) => {
                    if (!tool) {
                        errorMessage(viewId, '未找到指定工具')
                        return
                    }
                    compile(viewId, tool, tool.base, false)
                })
                .finally(() => {
                    setIsLoading(false)
                    message.destroy('LOADING')
                })

            return
        }

        ;(username === '!' ? r_tool_get_source : r_tool_get_dist)(
            username,
            toolId,
            ver || 'latest',
            platform
        )
            .then((res: AxiosResponse<_Response<ToolWithSourceVo | ToolWithDistVo>>) => {
                const response = res.data
                switch (response.code) {
                    case DATABASE_SELECT_SUCCESS:
                        return response.data!
                    case DATABASE_NO_RECORD_FOUND:
                        throw Error('未找到指定工具')
                    default:
                        throw Error('获取工具信息失败，请稍后重试')
                }
            })
            .then((toolVo) => processBaseDist(toolVo.base.id, toolVo.base.version, { toolVo }))
            .then(({ toolVo, toolBaseVo }) => {
                compile(viewId, toolVo, toolBaseVo, username === '!')
            })
            .catch((reason: Error) => {
                reason && errorMessage(viewId, reason.message)
            })
            .finally(() => {
                setIsLoading(false)
                message.destroy('LOADING')
            })
    }

    useEffect(() => {
        themeRef.current = theme
        isDarkModeRef.current = isDarkMode
        refreshGlobalVariables(isMainWindow ? undefined : oxygenApi.windowId)
    }, [theme, isDarkMode])

    useEffect(
        isMainWindow
            ? () => {
                  oxygenApi.tool.view.onLoad(
                      (
                          username,
                          toolId,
                          platform = import.meta.env.VITE_PLATFORM,
                          ver = 'latest',
                          source
                      ) => {
                          if (isLoading) {
                              return
                          }
                          setIsLoading(true)

                          oxygenApi.window.tab.create('tool').then((viewId) => {
                              if (!['WEB', 'DESKTOP'].includes(platform)) {
                                  errorMessage(viewId, `不支持的平台：${platform}`)
                                  return
                              }
                              if (username === '!' && !getLoginStatus()) {
                                  errorMessage(viewId, '未登录')
                                  return
                              }
                              username &&
                                  toolId &&
                                  loadTool(viewId, username, toolId, platform, ver, source)
                          })
                      }
                  )

                  return () => {
                      oxygenApi.tool.view.offLoad()
                  }
              }
            : () => {
                  if (!oxygenApi.toolInfo) {
                      isCompiled.current = true
                      return
                  }
                  if (isLoading) {
                      return
                  }
                  setIsLoading(true)

                  try {
                      const {
                          username,
                          toolId,
                          platform,
                          version = 'latest'
                      }: ToolInfo = JSON.parse(atob(oxygenApi.toolInfo))
                      loadTool(oxygenApi.windowId!, username, toolId, platform, version)
                  } catch (_) {
                      errorMessage(oxygenApi.windowId!, '解析工具信息失败')
                  }
              },
        []
    )

    return <></>
}

export default ToolLoader
