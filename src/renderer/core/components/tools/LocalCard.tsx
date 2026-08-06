import { DetailedHTMLProps, HTMLAttributes, MouseEvent } from 'react'
import VanillaTilt, { TiltOptions } from 'vanilla-tilt'
import Icon from '@ant-design/icons'
import useStyles from '@/assets/css/components/tools/local-card.style'
import { useConfigValueSafe } from '$/components/config/ConfigContext'
import { checkDesktop, message, modal, omitTextByByte } from '$/util/common'
import { getAppUrl, navigateToStore, navigateToView } from '$/util/navigation'
import Card from '$/components/Card'
import FlexBox from '$/components/FlexBox'
import DragHandle from '$/components/dnd/DragHandle'
import Draggable from '$/components/dnd/Draggable'

interface LocalCardProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
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
    onUninstall?: (username: string, toolId: string) => void
}

const LocalCard = ({
    style,
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
    onUninstall,
    ...props
}: LocalCardProps) => {
    const { styles, theme } = useStyles()
    const navigate = useNavigate()
    const cardRef = useRef<HTMLDivElement>(null)
    const homeUrl = useConfigValueSafe('homeUrl')

    useEffect(() => {
        cardRef.current && VanillaTilt.init(cardRef.current, options)
    }, [options])

    const handleCardOnClick = () => {
        if (platform === 'ANDROID') {
            if (!homeUrl) {
                void message.warning('离线模式无法生成二维码')
                return
            }
            void modal.info({
                centered: true,
                icon: <Icon style={{ color: theme.colorPrimary }} component={IconOxygenInfo} />,
                title: 'Android 端',
                content: (
                    <FlexBox className={styles.androidQrcode}>
                        <AntdQRCode
                            value={getAppUrl(homeUrl, author.username, toolId)}
                            size={300}
                        />
                        <AntdTag>请使用手机端扫描上方二维码</AntdTag>
                    </FlexBox>
                )
            })
            return
        }
        navigateToView(author.username, toolId, platform, undefined, true)
    }

    const handleOnClickAuthor = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        navigateToStore(navigate, author.username)
    }

    const handleOnUninstallBtnClick = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        onUninstall?.(author.username, toolId)
    }

    const handleOnAndroidBtnClick = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        if (!homeUrl) {
            void message.warning('离线模式无法生成二维码')
            return
        }
        void modal.info({
            centered: true,
            icon: <Icon style={{ color: theme.colorPrimary }} component={IconOxygenInfo} />,
            title: 'Android 端',
            content: (
                <FlexBox className={styles.androidQrcode}>
                    <AntdQRCode value={getAppUrl(homeUrl, author.username, toolId)} size={300} />
                    <AntdTag>请使用手机端扫描上方二维码</AntdTag>
                </FlexBox>
            )
        })
    }

    const handleOnWebBtnClick = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        navigateToView(author.username, toolId, 'WEB', undefined, true)
    }

    return (
        <Draggable
            id={`${author.username}:${toolId}:local:${platform}`}
            data={{
                icon,
                toolName,
                toolId,
                authorUsername: author.username,
                ver: 'local',
                platform
            }}
            hasDragHandle
        >
            <Card
                style={{ overflow: 'visible', ...style }}
                ref={cardRef}
                {...props}
                onClick={handleCardOnClick}
            >
                <FlexBox className={styles.root}>
                    <div className={styles.header}>
                        <div className={styles.version}>
                            <AntdTag>
                                {platform.slice(0, 1)}-{ver}
                            </AntdTag>
                        </div>
                        <div className={styles.operation}>
                            <AntdTooltip title={'卸载'}>
                                <Icon
                                    component={IconOxygenDelete}
                                    onClick={handleOnUninstallBtnClick}
                                />
                            </AntdTooltip>
                            {homeUrl &&
                                platform !== 'ANDROID' &&
                                supportPlatform.includes('ANDROID') && (
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
                            {platform !== 'ANDROID' && (checkDesktop() || platform === 'WEB') && (
                                <DragHandle />
                            )}
                        </div>
                    </div>
                    <div className={styles.icon}>
                        <img src={`data:image/svg+xml;base64,${icon}`} alt={''} />
                    </div>
                    <div className={styles.info}>
                        <div className={styles.toolName} title={toolName}>
                            {toolName}
                        </div>
                        <div>{`ID: ${toolId}`}</div>
                        {toolDesc && (
                            <div className={styles.toolDesc} title={toolDesc}>
                                {omitTextByByte(toolDesc, 64)}
                            </div>
                        )}
                    </div>
                    {showAuthor && (
                        <div className={styles.author} onClick={handleOnClickAuthor}>
                            <div className={styles.avatar}>
                                <AntdAvatar
                                    src={
                                        <AntdImage
                                            preview={false}
                                            src={`data:image/png;base64,${author.userInfo.avatar}`}
                                            alt={''}
                                        />
                                    }
                                    style={{ background: theme.colorBgLayout }}
                                />
                            </div>
                            <div className={styles.authorName}>{author.userInfo.nickname}</div>
                        </div>
                    )}
                </FlexBox>
            </Card>
        </Draggable>
    )
}

export default LocalCard
