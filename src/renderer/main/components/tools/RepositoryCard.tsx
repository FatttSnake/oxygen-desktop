import { DetailedHTMLProps, HTMLAttributes } from 'react'
import VanillaTilt, { TiltOptions } from 'vanilla-tilt'
import useStyles from '@/assets/css/components/tools/repository-card.style'
import { omitTextByByte } from '@/util/common'
import Card from '@/components/common/Card'
import FlexBox from '@/components/common/FlexBox'
import Draggable from '@/components/dnd/Draggable'
import DragHandle from '@/components/dnd/DragHandle'

interface RepositoryCardProps
    extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    icon: string
    toolName: string
    toolId: string
    toolDesc?: string
    ver: string
    platform: Platform
    options?: TiltOptions
    onOpen?: () => void
    onEdit?: () => void
    onSource?: () => void
    onPublish?: () => void
    onCancelReview?: () => void
    onDelete?: () => void
}

const RepositoryCard = ({
    style,
    ref,
    icon,
    toolName,
    toolId,
    toolDesc,
    ver,
    platform,
    options = {
        reverse: true,
        max: 8,
        glare: true,
        ['max-glare']: 0.3,
        scale: 1.03
    },
    onOpen,
    onEdit,
    onSource,
    onPublish,
    onCancelReview,
    onDelete,
    children,
    ...props
}: RepositoryCardProps) => {
    const { styles } = useStyles()
    const cardRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        cardRef.current && VanillaTilt.init(cardRef.current, options)
    }, [options])

    return (
        <Draggable
            id={`!:${toolId}:${ver}:${platform}`}
            data={{ icon, toolName, toolId, authorUsername: '!', ver, platform }}
        >
            <Card style={{ ...style }} ref={cardRef} {...props}>
                <FlexBox className={styles.root}>
                    <div className={styles.header}>
                        {children}
                        <DragHandle />
                    </div>
                    <div className={styles.icon}>
                        <img src={`data:image/svg+xml;base64,${icon}`} alt={'Icon'} />
                    </div>
                    <div className={styles.info}>
                        <div className={styles.toolName} title={toolName}>
                            {toolName}
                        </div>
                        <div>{`ID: ${toolId}`}</div>
                        <div className={styles.toolDesc} title={toolDesc}>
                            {toolDesc && omitTextByByte(toolDesc, 64)}
                        </div>
                    </div>
                    <div className={styles.operation}>
                        {onOpen && (
                            <AntdButton onClick={onOpen} size={'small'} type={'primary'}>
                                打开
                            </AntdButton>
                        )}
                        {onEdit && onPublish && (
                            <div className={styles.edit}>
                                <AntdButton.Group size={'small'}>
                                    <AntdButton onClick={onEdit}>编辑</AntdButton>
                                    <AntdButton onClick={onPublish}>发布</AntdButton>
                                </AntdButton.Group>
                            </div>
                        )}
                        {onSource && (
                            <AntdButton size={'small'} onClick={onSource}>
                                源码
                            </AntdButton>
                        )}
                        {onCancelReview && (
                            <AntdButton size={'small'} onClick={onCancelReview}>
                                取消审核
                            </AntdButton>
                        )}
                        {onDelete && (
                            <AntdButton size={'small'} danger onClick={onDelete}>
                                删除
                            </AntdButton>
                        )}
                    </div>
                </FlexBox>
            </Card>
        </Draggable>
    )
}

export default RepositoryCard
