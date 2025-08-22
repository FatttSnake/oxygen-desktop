import Icon from '@ant-design/icons'
import useStyles from '%/assets/css/pages/system/tools/code.style'
import { DATABASE_NO_RECORD_FOUND, DATABASE_SELECT_SUCCESS } from '$/constants/common.constants'
import { message, modal, checkDesktop } from '$/util/common'
import { navigateToExecute, navigateToRepository, navigateToTools } from '$/util/navigation'
import { addExtraCssVariables, formatToolBaseVersion } from '$/util/tool'
import editorExtraLibs from '$/util/editorExtraLibs'
import { r_sys_tool_get_one } from '$/services/system'
import { CommonContext } from '$/CommonFramework'
import FitFullscreen from '$/components/FitFullscreen'
import Card from '$/components/Card'
import FlexBox from '$/components/FlexBox'
import LoadingMask from '$/components/LoadingMask'
import Playground from '$/components/Playground'
import { usePlaygroundState } from '$/hooks/usePlaygroundState'
import { base64ToFiles } from '$/components/Playground/files'
import ToolBar from '@/components/tools/ToolBar'

const { Text } = AntdTypography

const Code = () => {
    const { styles } = useStyles()
    const { isDarkMode } = useContext(CommonContext)
    const navigate = useNavigate()
    const { id } = useParams()
    const { init, tsconfig, files, selectedFileName, setSelectedFileName } = usePlaygroundState()
    const [toolData, setToolData] = useState<ToolWithSourceVo>()
    const [isLoading, setIsLoading] = useState(false)
    const [platform, setPlatform] = useState<Platform>('WEB')

    const handleOnRunTool = () => {
        if (checkDesktop() || platform === 'WEB') {
            void modal.confirm({
                centered: true,
                maskClosable: true,
                title: '注意',
                content: '运行前请仔细查阅工具代码！',
                onOk: () => {
                    navigateToExecute(navigate, id!)
                }
            })
        } else {
            void message.warning('此应用需要桌面端环境，请在桌面端运行')
        }
    }

    const render = (toolVo: ToolWithSourceVo) => {
        try {
            init(base64ToFiles(toolVo.source.data!), true, toolVo.entryPoint, toolVo.entryPoint)
            setPlatform(toolVo.platform)
        } catch (e) {
            void message.error('载入工具失败')
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
                    case DATABASE_SELECT_SUCCESS:
                        setToolData(response.data!)
                        render(response.data!)
                        break
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
