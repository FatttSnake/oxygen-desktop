import { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react'
import VanillaTilt, { TiltOptions } from 'vanilla-tilt'
import '@/assets/css/components/tools/repository-card.scss'
import Card from '@/components/common/Card'
import FlexBox from '@/components/common/FlexBox'

interface RepositoryCardProps
    extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    icon: ReactNode
    toolName: string
    toolId: string
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ref,
    icon,
    toolName,
    toolId,
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
        <Card
            data-component={'component-repository-card'}
            style={{ overflow: 'visible', ...style }}
            ref={cardRef}
            {...props}
        >
            <FlexBox className={'repository-card'}>
                <div className={'icon'}>{icon}</div>
                <div className={'info'}>
                    {toolName && <div className={'tool-name'}>{toolName}</div>}
                    {toolId && <div className={'tool-id'}>{`ID: ${toolId}`}</div>}
                </div>
                <div className={'operation'}>
                    {onOpen && (
                        <AntdButton onClick={onOpen} size={'small'} type={'primary'}>
                            打开
                        </AntdButton>
                    )}
                    {onEdit && onPublish && (
                        <div className={'edit'}>
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
                {children}
            </FlexBox>
        </Card>
    )
}

export default RepositoryCard
