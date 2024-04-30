import { DetailedHTMLProps, HTMLAttributes, MouseEvent, ReactNode } from 'react'
import VanillaTilt, { TiltOptions } from 'vanilla-tilt'
import protocolCheck from 'custom-protocol-check'
import Icon from '@ant-design/icons'
import '@/assets/css/components/tools/store-card.scss'
import { COLOR_BACKGROUND, COLOR_MAIN, COLOR_PRODUCTION } from '@/constants/common.constants'
import { checkDesktop } from '@/util/common'
import { navigateToSource, navigateToStore, navigateToView } from '@/util/navigation'
import { r_tool_add_favorite, r_tool_remove_favorite } from '@/services/tool'
import Card from '@/components/common/Card'
import FlexBox from '@/components/common/FlexBox'

interface StoreCardProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    icon: ReactNode
    toolName: string
    toolId: string
    toolDesc: string
    options?: TiltOptions
    authorName?: string
    authorAvatar?: string
    authorUsername: string
    ver: string
    platform: Platform
    supportPlatform: Platform[]
    favorite: boolean
}

const StoreCard = ({
    style,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ref,
    icon,
    toolName,
    toolId,
    toolDesc,
    options = {
        reverse: true,
        max: 8,
        glare: true,
        ['max-glare']: 0.3,
        scale: 1.03
    },
    authorName,
    authorAvatar,
    authorUsername,
    ver,
    platform,
    supportPlatform,
    favorite,
    ...props
}: StoreCardProps) => {
    const navigate = useNavigate()
    const [modal, contextHolder] = AntdModal.useModal()
    const cardRef = useRef<HTMLDivElement>(null)
    const [favorite_, setFavorite_] = useState<boolean>(favorite)

    useEffect(() => {
        cardRef.current && VanillaTilt.init(cardRef.current, options)
    }, [options])

    const handleCardOnClick = () => {
        if (!checkDesktop() && platform === 'DESKTOP') {
            void message.warning('此应用需要桌面端环境，请在桌面端打开')
            return
        }
        if (platform === 'ANDROID') {
            void modal.info({
                icon: <Icon style={{ color: COLOR_MAIN }} component={IconOxygenInfo} />,
                title: 'Android 端',
                centered: true,
                maskClosable: true,
                content: (
                    <FlexBox className={'android-qrcode'}>
                        <AntdQRCode
                            value={`oxygen://openurl/view/${authorUsername}/${toolId}`}
                            size={300}
                        />
                        <AntdTag className={'tag'}>请使用手机端扫描上方二维码</AntdTag>
                    </FlexBox>
                )
            })
            return
        }
        navigateToView(navigate, authorUsername, toolId, platform)
    }

    const handleOnClickAuthor = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        navigateToStore(navigate, authorUsername)
    }

    const handleOnSourceBtnClick = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        navigateToSource(navigate, authorUsername, toolId, platform)
    }

    const handleOnStarBtnClick = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        if (favorite_) {
            void r_tool_remove_favorite({
                username: authorUsername,
                toolId: toolId,
                platform: platform
            }).then((res) => {
                const response = res.data
                if (response.success) {
                    setFavorite_(false)
                } else {
                    void message.error('取消收藏失败，请稍后重试')
                }
            })
        } else {
            void r_tool_add_favorite({
                username: authorUsername,
                toolId: toolId,
                platform: platform
            }).then((res) => {
                const response = res.data
                if (response.success) {
                    setFavorite_(true)
                } else {
                    void message.error('收藏失败，请稍后重试')
                }
            })
        }
    }

    const handleOnAndroidBtnClick = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        void modal.info({
            icon: <Icon style={{ color: COLOR_MAIN }} component={IconOxygenInfo} />,
            title: 'Android 端',
            centered: true,
            maskClosable: true,
            content: (
                <FlexBox className={'android-qrcode'}>
                    <AntdQRCode
                        value={`oxygen://openurl/view/${authorUsername}/${toolId}`}
                        size={300}
                    />
                    <AntdTag className={'tag'}>请使用手机端扫描上方二维码</AntdTag>
                </FlexBox>
            )
        })
    }

    const handleOnDesktopBtnClick = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        if (!checkDesktop()) {
            void message.loading({ content: '启动桌面端中……', key: 'LOADING', duration: 0 })
            protocolCheck(
                `oxygen://openurl/view/${authorUsername}/${toolId}`,
                () => {
                    void message.warning('打开失败,此应用需要桌面端环境,请安装桌面端后重试')
                    void message.destroy('LOADING')
                },
                () => {
                    void message.destroy('LOADING')
                },
                2000,
                () => {
                    void message.warning('打开失败,此应用需要桌面端环境,请安装桌面端后重试')
                    void message.destroy('LOADING')
                }
            )
            return
        }
        navigateToView(navigate, authorUsername, toolId, platform)
    }

    const handleOnWebBtnClick = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        navigateToView(navigate, authorUsername, toolId, platform)
    }

    return (
        <>
            <Card
                data-component={'component-store-card'}
                style={{ overflow: 'visible', ...style }}
                ref={cardRef}
                {...props}
                onClick={handleCardOnClick}
            >
                <FlexBox className={'store-card'}>
                    <div className={'icon'}>{icon}</div>
                    <div className={'version'}>
                        <AntdTag>
                            {platform.slice(0, 1)}-{ver}
                        </AntdTag>
                    </div>
                    <div className={'info'}>
                        <div className={'tool-name'}>{toolName}</div>
                        <div className={'tool-id'}>{`ID: ${toolId}`}</div>
                        {toolDesc && <div className={'tool-desc'}>{`简介：${toolDesc}`}</div>}
                    </div>
                    {authorAvatar && authorName && (
                        <div className={'author'} onClick={handleOnClickAuthor}>
                            <div className={'avatar'}>
                                <AntdAvatar
                                    src={
                                        <AntdImage
                                            preview={false}
                                            src={`data:image/png;base64,${authorAvatar}`}
                                            alt={'Avatar'}
                                        />
                                    }
                                    style={{ background: COLOR_BACKGROUND }}
                                />
                            </div>
                            <AntdTooltip title={authorUsername}>
                                <div className={'author-name'}>{authorName}</div>
                            </AntdTooltip>
                        </div>
                    )}
                    <div className={'operation'}>
                        {platform !== 'ANDROID' && supportPlatform.includes('ANDROID') && (
                            <AntdTooltip title={'Android 端'}>
                                <Icon
                                    component={IconOxygenMobile}
                                    onClick={handleOnAndroidBtnClick}
                                />
                            </AntdTooltip>
                        )}
                        {platform === 'DESKTOP' && supportPlatform.includes('WEB') && (
                            <AntdTooltip title={'Web 端'}>
                                <Icon component={IconOxygenBrowser} onClick={handleOnWebBtnClick} />
                            </AntdTooltip>
                        )}
                        {platform === 'WEB' && supportPlatform.includes('DESKTOP') && (
                            <AntdTooltip title={'桌面端'}>
                                <Icon
                                    component={IconOxygenDesktop}
                                    onClick={handleOnDesktopBtnClick}
                                />
                            </AntdTooltip>
                        )}
                        <AntdTooltip title={'源码'}>
                            <Icon component={IconOxygenCode} onClick={handleOnSourceBtnClick} />
                        </AntdTooltip>
                        <AntdTooltip title={favorite_ ? '取消收藏' : '收藏'}>
                            <Icon
                                component={favorite_ ? IconOxygenStarFilled : IconOxygenStar}
                                style={{ color: favorite_ ? COLOR_PRODUCTION : undefined }}
                                onClick={handleOnStarBtnClick}
                            />
                        </AntdTooltip>
                    </div>
                </FlexBox>
            </Card>
            {contextHolder}
        </>
    )
}

export default StoreCard
