import { DetailedHTMLProps, HTMLAttributes } from 'react'
import VanillaTilt, { TiltOptions } from 'vanilla-tilt'
import styles from '@/assets/css/components/tools/repository-card.module.less'
import Card from '@/components/common/Card'
import FlexBox from '@/components/common/FlexBox'
import Draggable from '@/components/dnd/Draggable'
import DragHandle from '@/components/dnd/DragHandle'

interface RepositoryCardProps
    extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    icon: string
    toolName: string
    toolId: string
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
    const cardRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        cardRef.current && VanillaTilt.init(cardRef.current, options)
    }, [options])

    return (
        <Draggable
            id={`!:${toolId}:${ver}:${platform}`}
            data={{ icon, toolName, toolId, authorUsername: '!', ver, platform }}
        >
            <Card
                className={styles.root}
                style={{ overflow: 'visible', ...style }}
                ref={cardRef}
                {...props}
            >
                <FlexBox className={styles.repositoryCard}>
                    <div className={styles.header}>
                        {children}
                        <DragHandle />
                    </div>
                    <div className={styles.icon}>
                        <img src={`data:image/svg+xml;base64,${icon}`} alt={'Icon'} />
                    </div>
                    <div className={styles.info}>
                        <div className={styles.toolName}>{toolName}</div>
                        <div>{`ID: ${toolId}`}</div>
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
