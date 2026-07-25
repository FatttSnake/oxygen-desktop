import useStyles from '@/assets/css/pages/tools/source.style'
import { DATABASE_NO_RECORD_FOUND, DATABASE_SELECT_SUCCESS } from '$/constants/common.constants'
import { message } from '$/util/common'
import { getLoginStatus } from '$/util/auth'
import { navigateToRepository, navigateToSource, navigateToStore } from '$/util/navigation'
import { addExtraCssVariables, formatToolBaseVersion } from '$/util/tool'
import editorExtraLibs from '$/util/editorExtraLibs'
import { r_tool_get_source } from '$/services/tool'
import { CommonContext } from '$/CommonFramework'
import FitFullscreen from '$/components/FitFullscreen'
import Card from '$/components/Card'
import LoadingMask from '$/components/LoadingMask'
import FlexBox from '$/components/FlexBox'
import { sourceListToFileTree } from '$/components/Playground/files'
import CodeEditor from '$/components/Playground/CodeEditor'
import { usePlaygroundState } from '$/hooks/usePlaygroundState'
import ToolBar from '@/components/tools/ToolBar'

const { Text } = AntdTypography

const Source = () => {
    const { styles } = useStyles()
    const { isDarkMode } = useContext(CommonContext)
    const navigate = useNavigate()
    const { username, toolId, ver } = useParams()
    const [searchParams] = useSearchParams({
        platform: import.meta.env.VITE_PLATFORM
    })
    const { init, fileTree, selectedFileKey, setSelectedFileKey } = usePlaygroundState()
    const [toolData, setToolData] = useState<ToolWithSourceVo>()
    const [isLoading, setIsLoading] = useState(false)
    const fromPath = searchParams.get('from') ?? undefined

    const render = (toolVo: ToolWithSourceVo) => {
        try {
            const fileTree = sourceListToFileTree(toolVo.sources)
            init(fileTree, true, toolVo.entryPoint)
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

        r_tool_get_source(
            username!,
            toolId!,
            ver || 'latest',
            searchParams.get('platform') as Platform
        )
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
        const platform = searchParams.get('platform')!
        if (!['WEB', 'DESKTOP', 'ANDROID'].includes(platform)) {
            navigateToRepository(navigate)
            return
        }
        if (username === '!' && !getLoginStatus()) {
            navigateToRepository(navigate)
            return
        }
        if (username !== '!' && ver) {
            navigateToSource(
                navigate,
                username!,
                toolId!,
                platform as Platform,
                undefined,
                fromPath
            )
            return
        }
        if (username === '!' && !ver) {
            navigateToSource(navigate, '!', toolId!, platform as Platform, 'latest', fromPath)
            return
        }
        getTool()
    }, [username, toolId, ver, searchParams])

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
                        onBack={() => (fromPath ? navigate(fromPath) : navigateToStore(navigate))}
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
    )
}

export default Source
