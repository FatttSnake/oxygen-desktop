import { Theme } from 'antd-style'
import logo from '$/assets/logo.svg?raw'
import removeOutdatedCssCode from '$/assets/template/playground/removeOutdatedCss.js?raw'
import setupGlobalJsVariablesCode from '$/assets/template/playground/setupGlobalJsVariables.js?raw'
import setupGlobalCssVariablesCode from '$/assets/template/playground/setupGlobalCssVariables.js?raw'
import { omitText } from '$/util/common'
import {
    convertObjToJsLiteral,
    generateThemeCssVariables,
    processBaseDist,
    removeUselessAttributes
} from '$/util/tool'
import Compiler, { handleBuildError } from '$/components/Playground/compiler'
import { IFileTree } from '$/components/Playground/shared'
import { getImportMap, sourceListToFileTree } from '$/components/Playground/files'

export const useCompilePreview = (
    theme: Omit<Theme, 'prefixCls'>,
    isDarkMode: boolean,
    name?: string,
    sources?: ToolSourceVo[],
    _fileTree?: IFileTree,
    entryPoint?: string,
    base?: ToolBaseVo
) => {
    const themeRef = useRef(theme)
    const isDarkModeRef = useRef(isDarkMode)
    const previewViewIdRef = useRef<string>()
    const abortRef = useRef<AbortController | null>(null)
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
        if (!previewViewId || !(sources || _fileTree) || !entryPoint) {
            return
        }

        const fileTree = _fileTree || sourceListToFileTree(sources!)

        abortRef.current?.abort()
        const controller = new AbortController()
        abortRef.current = controller

        const timer = setTimeout(async () => {
            const importMap = getImportMap(fileTree)
            oxygenApi.window.tab.title(previewViewId, `[编译中] ${name}`)
            let baseDist = ''
            if (base) {
                try {
                    baseDist = (await processBaseDist(base.id, base.version, {})).toolBaseVo.dist
                        .fileContent
                } catch (_) {
                    oxygenApi.window.tab.title(previewViewId, `[编译失败] 获取基板出错`)
                }
            }
            Compiler.compile(
                fileTree,
                importMap,
                entryPoint,
                (state, message) =>
                    oxygenApi.window.tab.title(
                        previewViewId,
                        `[编译中] ${state === 'processing' ? omitText(message, 30) : name}`
                    ),
                controller.signal
            )
                .then((result) => {
                    if (controller.signal.aborted) {
                        return
                    }

                    const dist = result.outputFiles[0].text
                    oxygenApi.window.tab.icon(
                        previewViewId,
                        `data:image/svg+xml;base64,${btoa(logo)}`
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
                            convertObjToJsLiteral(
                                generateThemeCssVariables(themeRef.current).styles
                            )
                        ),
                        previewViewId
                    )
                    oxygenApi.tool.view.render(
                        `(() => {${dist}})();\n(() => {${baseDist}})();`,
                        previewViewId
                    )
                })
                .catch((e) => {
                    if (controller.signal.aborted) {
                        return
                    }

                    const formattedError = handleBuildError(e)
                    oxygenApi.window.tab.icon(
                        previewViewId,
                        `data:image/svg+xml;base64,${btoa(logo)}`
                    )
                    oxygenApi.window.tab.title(previewViewId, `[编译异常] ${name}`)
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
                            convertObjToJsLiteral(
                                generateThemeCssVariables(themeRef.current).styles
                            )
                        ),
                        previewViewId
                    )
                    oxygenApi.tool.view.render(
                        `(() => {
                            const errorText = ${JSON.stringify(formattedError)};
                            const element = document.createElement('div');
                            element.style.cssText = \`
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                color: #dc4446;
                                font-family: monospace;
                                padding: 20px;
                                white-space: pre-wrap;
                                word-break: break-word;
                                max-width: 100%;
                                overflow: auto;
                            \`;
                            element.textContent = errorText;
                            document.getElementById('root')?.replaceChildren(element);
                        })();`,
                        previewViewId
                    )
                })
        }, 500)

        return () => {
            clearTimeout(timer)
            controller.abort()
        }
    }, [previewViewId, name, sources, _fileTree, entryPoint, base])

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
