import '@/assets/css/pages/tools/view.scss'
import { DATABASE_NO_RECORD_FOUND, DATABASE_SELECT_SUCCESS } from '@/constants/common.constants'
import { getLoginStatus } from '@/util/auth'
import { r_tool_detail } from '@/services/tool'
import compiler from '@/components/Playground/compiler'
import { IImportMap } from '@/components/Playground/shared'
import { base64ToFiles, base64ToStr, IMPORT_MAP_FILE_NAME } from '@/components/Playground/files'
import FitFullscreen from '@/components/common/FitFullscreen'
import Playground from '@/components/Playground'
import Card from '@/components/common/Card'

const View = () => {
    const navigate = useNavigate()
    const { username, toolId, ver } = useParams()
    const [searchParams] = useSearchParams({
        platform: import.meta.env.VITE_PLATFORM
    })
    const [loading, setLoading] = useState(false)
    const [compiledCode, setCompiledCode] = useState('')
    const [isAndroid, setIsAndroid] = useState(false)

    const render = (toolVo: ToolVo) => {
        setIsAndroid(toolVo.platform === 'ANDROID')
        if (username === '!') {
            try {
                const baseDist = base64ToStr(toolVo.base.dist.data!)
                const files = base64ToFiles(toolVo.source.data!)
                const importMap = JSON.parse(files[IMPORT_MAP_FILE_NAME].value) as IImportMap

                void compiler
                    .compile(files, importMap, toolVo.entryPoint)
                    .then((result) => {
                        const output = result.outputFiles[0].text
                        setCompiledCode(`${output}\n${baseDist}`)
                    })
                    .catch((reason) => {
                        void message.error(`编译失败：${reason}`)
                    })
            } catch (e) {
                void message.error('载入工具失败')
            }
        } else {
            try {
                const baseDist = base64ToStr(toolVo.base.dist.data!)
                const dist = base64ToStr(toolVo.dist.data!)
                setCompiledCode(`${dist}\n${baseDist}`)
            } catch (e) {
                void message.error('载入工具失败')
            }
        }
    }

    const getTool = () => {
        if (loading) {
            return
        }
        setLoading(true)
        void message.loading({ content: '加载中……', key: 'LOADING', duration: 0 })

        void r_tool_detail(
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
                        void message.error('未找到指定工具')
                        setTimeout(() => {
                            navigate('/')
                        }, 3000)
                        break
                    default:
                        void message.error('获取工具信息失败，请稍后重试')
                }
            })
            .finally(() => {
                setLoading(false)
                message.destroy('LOADING')
            })
    }

    useEffect(() => {
        if (username === '!' && !getLoginStatus()) {
            setTimeout(() => {
                navigate('/')
            }, 3000)
            return
        }
        if (username !== '!' && ver) {
            navigate(`/view/${username}/${toolId}`)
            return
        }
        if (username === '!' && !ver) {
            navigate(`/view/!/${toolId}/latest`)
            return
        }
        if (!['WEB', 'DESKTOP', 'ANDROID'].includes(searchParams.get('platform')!)) {
            navigate('/')
            return
        }
        getTool()
    }, [])

    return (
        <FitFullscreen data-component={'tools-view'}>
            <Card>
                <Playground.Output.Preview.Render
                    iframeKey={`${username}:${toolId}:${ver}`}
                    compiledCode={compiledCode}
                    mobileMode={isAndroid}
                />
            </Card>
        </FitFullscreen>
    )
}

export default View
