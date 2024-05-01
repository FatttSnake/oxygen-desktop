import { UIEvent } from 'react'
import '@/assets/css/pages/tools/store.scss'
import { DATABASE_SELECT_SUCCESS } from '@/constants/common.constants'
import { checkDesktop } from '@/util/common'
import { r_tool_store_get } from '@/services/tool'
import FlexBox from '@/components/common/FlexBox'
import FitFullscreen from '@/components/common/FitFullscreen'
import HideScrollbar from '@/components/common/HideScrollbar'
import StoreCard from '@/components/tools/StoreCard'
import LoadMoreCard from '@/components/tools/LoadMoreCard'

const Store = () => {
    const scrollTopRef = useRef(0)
    const [isLoading, setIsLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(0)
    const [hasNextPage, setHasNextPage] = useState(false)
    const [toolData, setToolData] = useState<ToolVo[]>([])
    const [hideSearch, setHideSearch] = useState(false)
    const [searchValue, setSearchValue] = useState('')

    const handleOnSearch = (value: string) => {
        setSearchValue(value)
        getTool(1, value)
    }

    const handleOnScroll = (event: UIEvent<HTMLDivElement>) => {
        if (event.currentTarget.scrollTop < scrollTopRef.current) {
            setHideSearch(false)
        } else {
            setHideSearch(true)
        }
        scrollTopRef.current = event.currentTarget.scrollTop
    }

    const handleOnLoadMore = () => {
        if (isLoading) {
            return
        }
        getTool(currentPage + 1, searchValue)
    }

    const getTool = (page: number, searchValue: string) => {
        if (isLoading) {
            return
        }
        setIsLoading(true)
        void message.loading({ content: '加载工具列表中', key: 'LOADING', duration: 0 })

        void r_tool_store_get({ currentPage: page, searchValue })
            .then((res) => {
                const response = res.data

                switch (response.code) {
                    case DATABASE_SELECT_SUCCESS:
                        setCurrentPage(response.data!.current)
                        if (
                            response.data!.current === response.data!.pages ||
                            response.data!.total === 0
                        ) {
                            setHasNextPage(false)
                        } else {
                            setHasNextPage(true)
                        }
                        if (response.data!.current === 1) {
                            setToolData(response.data!.records)
                        } else {
                            setToolData([...toolData, ...response.data!.records])
                        }
                        break
                    default:
                        void message.error('加载失败，请稍后重试')
                }
            })
            .finally(() => {
                setIsLoading(false)
                message.destroy('LOADING')
            })
    }

    useEffect(() => {
        getTool(1, '')
    }, [])

    return (
        <>
            <FitFullscreen data-component={'tools-store'}>
                <HideScrollbar
                    isShowVerticalScrollbar
                    autoHideWaitingTime={1000}
                    onScroll={handleOnScroll}
                >
                    <div className={`search${hideSearch ? ' hide' : ''}`}>
                        <AntdInput.Search
                            enterButton
                            allowClear
                            loading={isLoading}
                            onSearch={handleOnSearch}
                            placeholder={'请输入工具名或关键字'}
                        />
                    </div>
                    <FlexBox direction={'horizontal'} className={'root-content'}>
                        {!toolData.length && <div className={'no-tool'}>未找到任何工具</div>}
                        {toolData
                            ?.reduce((previousValue: ToolVo[], currentValue) => {
                                if (
                                    !previousValue.some(
                                        (value) =>
                                            value.author.id === currentValue.author.id &&
                                            value.toolId === currentValue.toolId
                                    )
                                ) {
                                    previousValue.push(currentValue)
                                }
                                return previousValue
                            }, [])
                            .map((item) => {
                                const tools = toolData.filter(
                                    (value) =>
                                        value.author.id === item.author.id &&
                                        value.toolId === item.toolId
                                )
                                const webTool = tools.find((value) => value.platform === 'WEB')
                                const desktopTool = tools.find(
                                    (value) => value.platform === 'DESKTOP'
                                )
                                const androidTool = tools.find(
                                    (value) => value.platform === 'ANDROID'
                                )
                                const firstTool =
                                    (checkDesktop()
                                        ? desktopTool || webTool
                                        : webTool || desktopTool) || androidTool

                                return (
                                    <StoreCard
                                        key={firstTool!.id}
                                        icon={firstTool!.icon}
                                        toolName={firstTool!.name}
                                        toolId={firstTool!.toolId}
                                        toolDesc={firstTool!.description}
                                        author={firstTool!.author}
                                        ver={firstTool!.ver}
                                        platform={firstTool!.platform}
                                        supportPlatform={tools.map((value) => value.platform)}
                                        favorite={firstTool!.favorite}
                                    />
                                )
                            })}
                        {hasNextPage && <LoadMoreCard onClick={handleOnLoadMore} />}
                    </FlexBox>
                </HideScrollbar>
            </FitFullscreen>
        </>
    )
}

export default Store
