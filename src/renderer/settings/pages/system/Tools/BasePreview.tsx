import Icon from '@ant-design/icons'
import useStyles from '%/assets/css/pages/system/tools/base-preview.style'
import { DATABASE_NO_RECORD_FOUND, DATABASE_SELECT_SUCCESS } from '$/constants/common.constants'
import { checkDesktop, message } from '$/util/common'
import { navigateToToolBase } from '$/util/navigation'
import editorExtraLibs from '$/util/editorExtraLibs'
import { addExtraCssVariables, formatToolBaseVersion } from '$/util/tool'
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
import { usePreview } from '$/hooks/usePreview'
import ToolBar from '@/components/tools/ToolBar'

const { Text } = AntdTypography

const BasePreview = () => {
    const { styles, theme } = useStyles()
    const { isDarkMode } = useContext(CommonContext)
    const navigate = useNavigate()
    const { id, version } = useParams()
    const { init, fileTree, selectedFileKey, setSelectedFileKey } = usePlaygroundState()
    const [isLoading, setIsLoading] = useState(false)
    const [toolBaseData, setToolBaseData] = useState<ToolBaseWithSourceVo>()
    const [toolBaseWithDistData, setToolBaseWithDistData] = useState<ToolBaseWithDistVo>()
    const { openPreview } = usePreview(
        theme,
        isDarkMode,
        toolBaseData?.name,
        undefined,
        toolBaseWithDistData?.dist.fileContent,
        undefined
    )

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
                    case DATABASE_SELECT_SUCCESS: {
                        const toolBaseVo = response.data!
                        if (!checkDesktop() && toolBaseVo.platform !== 'WEB') {
                            message.error('此基板需要桌面端环境，请在桌面端打开').then(() => {
                                navigateToToolBase(navigate)
                            })
                            throw Error()
                        }
                        return toolBaseVo
                    }
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
        getToolBase()
    }, [id, version])

    return (
        <>
            <FitFullscreen className={styles.root}>
                <LoadingMask hidden={!isLoading}>
                    <FlexBox className={styles.layout} direction={'vertical'}>
                        <ToolBar
                            title={toolBaseData?.name}
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
                                    onClick={openPreview}
                                >
                                    预览
                                </AntdButton>
                            )}
                        </ToolBar>
                        <Card>
                            <CodeEditor
                                isDarkMode={isDarkMode}
                                fileTree={fileTree}
                                selectedFileKey={selectedFileKey}
                                readonly
                                extraLibs={editorExtraLibs}
                                onEditorDidMount={(_, monaco) => addExtraCssVariables(monaco)}
                                onSelectedFileChange={setSelectedFileKey}
                            />
                        </Card>
                    </FlexBox>
                </LoadingMask>
            </FitFullscreen>
        </>
    )
}

export default BasePreview
