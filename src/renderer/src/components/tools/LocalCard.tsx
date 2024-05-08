import { DetailedHTMLProps, HTMLAttributes, MouseEvent } from 'react'
import VanillaTilt, { TiltOptions } from 'vanilla-tilt'
import Icon from '@ant-design/icons'
import '@/assets/css/components/tools/local-card.scss'
import { COLOR_BACKGROUND, COLOR_MAIN } from '@/constants/common.constants'
import { checkDesktop, omitText } from '@/util/common'
import { navigateToStore, navigateToView } from '@/util/navigation'
import Card from '@/components/common/Card'
import FlexBox from '@/components/common/FlexBox'
import DragHandle from '@/components/dnd/DragHandle'
import Draggable from '@/components/dnd/Draggable'

interface StoreCardProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    icon: string
    toolName: string
    toolId: string
    toolDesc: string
    options?: TiltOptions
    author: UserWithInfoVo
    showAuthor?: boolean
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
    author,
    showAuthor = true,
    ver,
    platform,
    supportPlatform,
    favorite,
    ...props
}: StoreCardProps) => {
    const navigate = useNavigate()
    const [modal, contextHolder] = AntdModal.useModal()
    const cardRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        cardRef.current && VanillaTilt.init(cardRef.current, options)
    }, [options])

    const handleCardOnClick = () => {
        if (!checkDesktop() && platform === 'DESKTOP') {
            void message.warning('此应用需要桌面端环境，请在桌面端打开')
            return
        }
        if (platform === 'ANDROID') {
            void modal.confirm({
                centered: true,
                icon: <Icon style={{ color: COLOR_MAIN }} component={IconOxygenInfo} />,
                title: 'Android 端',
                content: (
                    <FlexBox className={'android-qrcode'}>
                        <AntdQRCode
                            value={`oxygen://openurl/view/${author.username}/${toolId}`}
                            size={300}
                        />
                        <AntdTag className={'tag'}>请使用手机端扫描上方二维码</AntdTag>
                    </FlexBox>
                ),
                okText: '确定',
                cancelText: '模拟器',
                onCancel() {
                    navigateToView(navigate, author.username, toolId, platform, undefined, true)
                }
            })
            return
        }
        navigateToView(navigate, author.username, toolId, platform, undefined, true)
    }

    const handleOnClickAuthor = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        navigateToStore(navigate, author.username)
    }

    const handleOnAndroidBtnClick = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        void modal.confirm({
            centered: true,
            icon: <Icon style={{ color: COLOR_MAIN }} component={IconOxygenInfo} />,
            title: 'Android 端',
            content: (
                <FlexBox className={'android-qrcode'}>
                    <AntdQRCode
                        value={`oxygen://openurl/view/${author.username}/${toolId}`}
                        size={300}
                    />
                    <AntdTag className={'tag'}>请使用手机端扫描上方二维码</AntdTag>
                </FlexBox>
            ),
            okText: '确定',
            cancelText: '模拟器',
            onCancel() {
                navigateToView(navigate, author.username, toolId, 'ANDROID', undefined, true)
            }
        })
    }

    const handleOnWebBtnClick = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        navigateToView(navigate, author.username, toolId, 'WEB', undefined, true)
    }

    return (
        <>
            <Draggable
                id={`${author.username}:${toolId}:local:${platform}`}
                data={{
                    icon,
                    toolName,
                    toolId,
                    authorUsername: author.username,
                    ver: 'local',
                    platform: platform
                }}
            >
                <Card
                    data-component={'component-local-card'}
                    style={{ overflow: 'visible', ...style }}
                    ref={cardRef}
                    {...props}
                    onClick={handleCardOnClick}
                >
                    <FlexBox className={'local-card'}>
                        <div className={'header'}>
                            <div className={'version'}>
                                <AntdTag>
                                    {platform.slice(0, 1)}-{ver}
                                </AntdTag>
                            </div>
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
                                        <Icon
                                            component={IconOxygenBrowser}
                                            onClick={handleOnWebBtnClick}
                                        />
                                    </AntdTooltip>
                                )}
                                <DragHandle />
                            </div>
                        </div>
                        <div className={'icon'}>
                            <img src={`data:image/svg+xml;base64,${icon}`} alt={'Icon'} />
                        </div>
                        <div className={'info'}>
                            <div className={'tool-name'}>{toolName}</div>
                            <div className={'tool-id'}>{`ID: ${toolId}`}</div>
                            {toolDesc && (
                                <div
                                    className={'tool-desc'}
                                    title={toolDesc}
                                >{`简介：${omitText(toolDesc, 18)}`}</div>
                            )}
                        </div>
                        {showAuthor && (
                            <div className={'author'} onClick={handleOnClickAuthor}>
                                <div className={'avatar'}>
                                    <AntdAvatar
                                        src={
                                            <AntdImage
                                                preview={false}
                                                src={`data:image/png;base64,${author.userInfo.avatar}`}
                                                alt={'Avatar'}
                                            />
                                        }
                                        style={{ background: COLOR_BACKGROUND }}
                                    />
                                </div>
                                <div className={'author-name'}>{author.userInfo.nickname}</div>
                            </div>
                        )}
                    </FlexBox>
                </Card>
            </Draggable>
            {contextHolder}
        </>
    )
}

export default StoreCard
