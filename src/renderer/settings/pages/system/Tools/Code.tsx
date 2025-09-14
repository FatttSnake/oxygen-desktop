import Icon from '@ant-design/icons'
import useStyles from '%/assets/css/pages/system/tools/code.style'
import setupGlobalJsVariablesCode from '$/assets/template/setupGlobalJsVariables.js?raw'
import setupGlobalCssVariablesCode from '$/assets/template/setupGlobalCssVariables.js?raw'
import { DATABASE_NO_RECORD_FOUND, DATABASE_SELECT_SUCCESS } from '$/constants/common.constants'
import { message, modal, checkDesktop } from '$/util/common'
import { navigateToRepository, navigateToTools } from '$/util/navigation'
import {
    addExtraCssVariables,
    convertObjToJsLiteral,
    formatToolBaseVersion,
    generateThemeCssVariables,
    processBaseDist,
    removeUselessAttributes
} from '$/util/tool'
import editorExtraLibs from '$/util/editorExtraLibs'
import { r_sys_tool_get_one } from '$/services/system'
import { CommonContext } from '$/CommonFramework'
import FitFullscreen from '$/components/FitFullscreen'
import Card from '$/components/Card'
import FlexBox from '$/components/FlexBox'
import LoadingMask from '$/components/LoadingMask'
import Playground from '$/components/Playground'
import { usePlaygroundState } from '$/hooks/usePlaygroundState'
import { IImportMap } from '$/components/Playground/shared'
import { base64ToFiles, base64ToStr, IMPORT_MAP_FILE_NAME } from '$/components/Playground/files'
import compiler from '$/components/Playground/compiler'
import ToolBar from '@/components/tools/ToolBar'

const { Text } = AntdTypography

const Code = () => {
    const { styles, theme } = useStyles()
    const { isDarkMode } = useContext(CommonContext)
    const navigate = useNavigate()
    const { id } = useParams()
    const { init, tsconfig, files, selectedFileName, setSelectedFileName } = usePlaygroundState()
    const themeRef = useRef(theme)
    const isDarkModeRef = useRef(isDarkMode)
    const [toolData, setToolData] = useState<ToolWithSourceVo>()
    const [isLoading, setIsLoading] = useState(false)
    const [isExecuting, setIsExecuting] = useState(false)

    const executeTool = () => {
        if (isExecuting || !toolData) {
            return
        }
        setIsExecuting(true)

        void message.loading({ content: '加载中……', key: 'LOADING', duration: 0 })
        processBaseDist(toolData.base.id, toolData.base.version, { toolVo: toolData })
            .then(({ toolVo, toolBaseVo }) =>
                oxygenApi.window.tab
                    .create('tool')
                    .then((viewId) => ({ viewId, toolVo, toolBaseVo }))
            )
            .then(async ({ viewId, toolVo, toolBaseVo }) => {
                const baseDist = base64ToStr(toolBaseVo.dist.data!)
                const files = base64ToFiles(toolVo.source.data!)
                const importMap = JSON.parse(files[IMPORT_MAP_FILE_NAME].value) as IImportMap
                const result = await compiler.compile(files, importMap, toolVo.entryPoint)
                return {
                    viewId,
                    toolVo,
                    baseDist,
                    dist: result.outputFiles[0].text
                }
            })
            .then(({ viewId, toolVo, baseDist, dist }) => {
                oxygenApi.window.tab.icon(viewId, `data:image/svg+xml;base64,${toolVo.icon}`)
                oxygenApi.window.tab.title(viewId, `[预览] ${toolVo.name}`)

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
                    viewId
                )
                oxygenApi.tool.view.render(
                    setupGlobalCssVariablesCode.replace(
                        "'${replace_with_code}'",
                        convertObjToJsLiteral(generateThemeCssVariables(themeRef.current).styles)
                    ),
                    viewId
                )
                oxygenApi.tool.view.render(`(() => {${dist}})();\n(() => {${baseDist}})();`, viewId)
            })
            .catch((reason) => {
                reason && message.error(reason)
            })
            .finally(() => {
                setIsExecuting(false)
                message.destroy('LOADING')
            })
    }

    const handleOnRunTool = () => {
        if (checkDesktop() || toolData!.platform === 'WEB') {
            void modal.confirm({
                centered: true,
                maskClosable: true,
                title: '注意',
                content: '运行前请仔细查阅工具代码！',
                onOk: () => {
                    executeTool()
                }
            })
        } else {
            void message.warning('此应用需要桌面端环境，请在桌面端运行')
        }
    }

    const getTool = () => {
        if (isLoading) {
            return
        }
        setIsLoading(true)
        void message.loading({ content: '加载中……', key: 'LOADING', duration: 0 })

        r_sys_tool_get_one(id!)
            .then((res) => {
                const response = res.data
                switch (response.code) {
                    case DATABASE_SELECT_SUCCESS: {
                        const toolVo = response.data!
                        setToolData(toolVo)
                        try {
                            init(
                                base64ToFiles(toolVo.source.data!),
                                true,
                                toolVo.entryPoint,
                                toolVo.entryPoint
                            )
                        } catch (e) {
                            void message.error('载入工具失败')
                        }
                        break
                    }
                    case DATABASE_NO_RECORD_FOUND:
                        message.error('未找到指定工具').then(() => {
                            navigateToRepository(navigate)
                        })
                        break
                    default:
                        void message.error('获取工具信息失败，请稍后重试')
                }
            })
            .finally(() => {
                setIsLoading(false)
                message.destroy('LOADING')
            })
    }

    useEffect(() => {
        themeRef.current = theme
        isDarkModeRef.current = isDarkMode
    }, [theme, isDarkMode])

    useEffect(() => {
        getTool()
    }, [id])

    return (
        <FitFullscreen className={styles.root}>
            <LoadingMask hidden={!isLoading}>
                <FlexBox className={styles.layout} direction={'vertical'}>
                    <ToolBar
                        title={toolData?.name}
                        subtitle={
                            <AntdTag color={'blue'}>
                                {`${toolData?.platform.slice(0, 1)}${toolData?.platform.slice(1).toLowerCase()}`}
                            </AntdTag>
                        }
                        onBack={() => navigateToTools(navigate)}
                    >
                        <span>
                            <Text strong>版本：</Text>
                            {toolData && toolData.ver}
                        </span>
                        <span>
                            <Text strong>基板：</Text>
                            <AntdSpace>
                                {toolData?.base.name}
                                {toolData && formatToolBaseVersion(toolData?.base.version)}
                            </AntdSpace>
                        </span>
                        {toolData && (
                            <AntdButton
                                size={'small'}
                                type={'primary'}
                                icon={<Icon component={IconOxygenExecute} />}
                                disabled={!toolData}
                                loading={isExecuting}
                                onClick={handleOnRunTool}
                            >
                                运行
                            </AntdButton>
                        )}
                    </ToolBar>
                    <Card>
                        <Playground.CodeEditor
                            isDarkMode={isDarkMode}
                            tsconfig={tsconfig}
                            files={files}
                            selectedFileName={selectedFileName}
                            readonly
                            extraLibs={editorExtraLibs}
                            onEditorDidMount={(_, monaco) => addExtraCssVariables(monaco)}
                            onSelectedFileChange={setSelectedFileName}
                        />
                    </Card>
                </FlexBox>
            </LoadingMask>
        </FitFullscreen>
    )
}

export default Code
