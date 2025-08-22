import useStyles from '@/assets/css/pages/tools/source.style'
import { DATABASE_NO_RECORD_FOUND, DATABASE_SELECT_SUCCESS } from '$/constants/common.constants'
import { message } from '$/util/common'
import { getLoginStatus } from '$/util/auth'
import { navigateToRepository, navigateToSource } from '$/util/navigation'
import { addExtraCssVariables } from '$/util/tool'
import editorExtraLibs from '$/util/editorExtraLibs'
import { r_tool_get_source } from '$/services/tool'
import { CommonContext } from '$/CommonFramework'
import FitFullscreen from '$/components/FitFullscreen'
import Card from '$/components/Card'
import Playground from '$/components/Playground'
import { usePlaygroundState } from '$/hooks/usePlaygroundState'
import { base64ToFiles } from '$/components/Playground/files'

const Source = () => {
    const { styles } = useStyles()
    const { isDarkMode } = useContext(CommonContext)
    const navigate = useNavigate()
    const { username, toolId, ver } = useParams()
    const [searchParams] = useSearchParams({
        platform: import.meta.env.VITE_PLATFORM
    })
    const { init, tsconfig, files, selectedFileName, setSelectedFileName } = usePlaygroundState()
    const [isLoading, setIsLoading] = useState(false)

    const render = (toolVo: ToolWithSourceVo) => {
        try {
            init(base64ToFiles(toolVo.source.data!), true, toolVo.entryPoint, toolVo.entryPoint)
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
            navigateToSource(navigate, username!, toolId!, platform as Platform)
            return
        }
        if (username === '!' && !ver) {
            navigateToSource(navigate, '!', toolId!, platform as Platform, 'latest')
            return
        }
        getTool()
    }, [username, toolId, ver, searchParams])

    return (
        <FitFullscreen className={styles.root}>
            <Card className={styles.content}>
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
        </FitFullscreen>
    )
}

export default Source
