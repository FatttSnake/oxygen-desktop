import logo from '$/assets/logo.svg?raw'
import setupGlobalJsVariablesCode from '$/assets/template/setupGlobalJsVariables.js?raw'
import setupGlobalCssVariablesCode from '$/assets/template/setupGlobalCssVariables.js?raw'
import useStyles from '%/assets/css/pages/system/tools/base-preview.style'
import { DATABASE_NO_RECORD_FOUND, DATABASE_SELECT_SUCCESS } from '$/constants/common.constants'
import { message } from '$/util/common'
import { navigateToToolBase } from '$/util/navigation'
import editorExtraLibs from '$/util/editorExtraLibs'
import {
    addExtraCssVariables,
    convertObjToJsLiteral,
    formatToolBaseVersion,
    generateThemeCssVariables,
    removeUselessAttributes
} from '$/util/tool'
import { r_sys_tool_base_get_one } from '$/services/system'
import { r_tool_base_get_dist } from '$/services/tool'
import { CommonContext } from '$/CommonFramework'
import FitFullscreen from '$/components/FitFullscreen'
import Card from '$/components/Card'
import FlexBox from '$/components/FlexBox'
import LoadingMask from '$/components/LoadingMask'
import { sourceListToFileTree } from '$/components/Playground/files'
import CodeEditor from '$/components/Playground/CodeEditor'
import { usePlaygroundState } from '$/hooks/usePlaygroundState'
import ToolBar from '@/components/tools/ToolBar'
import Icon from '@ant-design/icons'

const { Text } = AntdTypography

const BasePreview = () => {
    const { styles, theme } = useStyles()
    const { isDarkMode } = useContext(CommonContext)
    const navigate = useNavigate()
    const { id, version } = useParams()
    const {
        init,
        fileTree,
        selectedFileKey,
        isReadonly,
        hasUnsavedChanges,
        setSelectedFileKey,
        listenOnError
    } = usePlaygroundState()
    const themeRef = useRef(theme)
    const isDarkModeRef = useRef(isDarkMode)
    const previewViewIdRef = useRef<string>()
    const [layout, setLayout] = useState<'horizontal' | 'vertical'>(
        window.innerWidth > window.innerHeight ? 'horizontal' : 'vertical'
    )
    const [isLoading, setIsLoading] = useState(false)
    const [toolBaseData, setToolBaseData] = useState<ToolBaseWithSourceVo>()
    const [toolBaseWithDistData, setToolBaseWithDistData] = useState<ToolBaseWithDistVo>()
    const [previewViewId, setPreviewViewId] = useState<string>()

    useBeforeUnload(
        useCallback(
            (event) => {
                if (hasUnsavedChanges) {
                    event.preventDefault()
                    event.returnValue = ''
                }
            },
            [hasUnsavedChanges]
        ),
        { capture: true }
    )

    const handleOnPreview = () => {
        if (previewViewId) {
            void oxygenApi.window.tab.switch(previewViewId)
            return
        }
        oxygenApi.window.tab.create('tool').then(setPreviewViewId)
    }

    const getToolBase = () => {
        if (isLoading) {
            return
        }
        setIsLoading(true)
        void message.loading({ content: '加载中……', key: 'LOADING', duration: 0 })

        r_sys_tool_base_get_one(id!, Number(version))
            .then((res) => {
                const response = res.data
                switch (response.code) {
                    case DATABASE_SELECT_SUCCESS:
                        return response.data!
                    case DATABASE_NO_RECORD_FOUND:
                        message.error('未找到指定工具基板').then(() => {
                            navigateToToolBase(navigate)
                        })
                        throw Error()
                    default:
                        throw Error('载入工具基板失败，请稍后重试')
                }
            })
            .then((toolBaseVo) => {
                setToolBaseData(toolBaseVo)
                const fileTree = sourceListToFileTree(toolBaseVo.sources)
                init(fileTree, true, undefined, selectedFileKey)
                return r_tool_base_get_dist(id!, Number(version))
            })
            .then((res) => {
                const response = res.data
                switch (response.code) {
                    case DATABASE_SELECT_SUCCESS:
                        return response.data!
                    case DATABASE_NO_RECORD_FOUND:
                        message.error('未找到指定工具基板').then(() => {
                            navigateToToolBase(navigate)
                        })
                        throw Error()
                    default:
                        throw Error('载入工具基板失败，请稍后重试')
                }
            })
            .then((toolBaseVo) => {
                setToolBaseWithDistData(toolBaseVo)
            })
            .catch((e: Error) => {
                console.error(e)
                e?.message && message.error(e.message)
            })
            .finally(() => {
                setIsLoading(false)
                message.destroy('LOADING')
            })
    }

    useEffect(() => {
        if (!previewViewId || !toolBaseWithDistData) {
            return
        }

        oxygenApi.window.tab.icon(previewViewId, `data:image/svg+xml;base64,${btoa(logo)}`)
        oxygenApi.window.tab.title(previewViewId, `[预览] ${toolBaseData!.name}`)
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
            `(() => {${toolBaseWithDistData.dist.fileContent}})();`,
            previewViewId
        )
    }, [previewViewId, toolBaseWithDistData])

    useEffect(() => {
        getToolBase()
    }, [id, version])

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
        const resizeListener = () => {
            setLayout(window.innerWidth > window.innerHeight ? 'horizontal' : 'vertical')
        }
        window.addEventListener('resize', resizeListener)

        return () => {
            oxygenApi.window.tab.offClosed()
            const previewViewId = previewViewIdRef.current
            previewViewId && oxygenApi.window.tab.close(previewViewId)
            window.removeEventListener('resize', resizeListener)
        }
    }, [])

    return (
        <>
            <FitFullscreen className={styles.root}>
                <LoadingMask hidden={!isLoading}>
                    <FlexBox className={styles.layout} direction={'vertical'}>
                        <ToolBar
                            title={`${toolBaseData?.name}${hasUnsavedChanges ? '*' : ''}`}
                            subtitle={
                                <>
                                    <AntdTag color={'blue'}>
                                        {`${toolBaseData?.platform.slice(0, 1)}${toolBaseData?.platform.slice(1).toLowerCase()}`}
                                    </AntdTag>
                                </>
                            }
                            onBack={() => navigateToToolBase(navigate)}
                        >
                            <span>
                                <Text strong>版本：</Text>
                                {toolBaseData && formatToolBaseVersion(toolBaseData?.version)}
                            </span>
                            {toolBaseWithDistData && (
                                <AntdButton
                                    size={'small'}
                                    type={'dashed'}
                                    icon={<Icon component={IconOxygenExecute} />}
                                    loading={isLoading}
                                    onClick={handleOnPreview}
                                >
                                    预览
                                </AntdButton>
                            )}
                        </ToolBar>
                        <Card>
                            <AntdSplitter layout={layout}>
                                <AntdSplitter.Panel collapsible>
                                    <CodeEditor
                                        isDarkMode={isDarkMode}
                                        fileTree={fileTree}
                                        selectedFileKey={selectedFileKey}
                                        readonly={isReadonly}
                                        extraLibs={editorExtraLibs}
                                        onEditorDidMount={(_, monaco) =>
                                            addExtraCssVariables(monaco)
                                        }
                                        onSelectedFileChange={setSelectedFileKey}
                                        listenOnError={listenOnError}
                                    />
                                </AntdSplitter.Panel>
                            </AntdSplitter>
                        </Card>
                    </FlexBox>
                </LoadingMask>
            </FitFullscreen>
        </>
    )
}

export default BasePreview
