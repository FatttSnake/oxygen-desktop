import VanillaTilt from 'vanilla-tilt'
import Icon from '@ant-design/icons'
import '@/assets/css/components/tools/load-more-card.less'
import FlexBox from '@/components/common/FlexBox'
import Card from '@/components/common/Card'

interface LoadMoreCardProps {
    onClick: () => void
}

const LoadMoreCard = ({ onClick }: LoadMoreCardProps) => {
    const cardRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        cardRef.current &&
            VanillaTilt.init(cardRef.current, {
                reverse: true,
                max: 8,
                glare: true,
                ['max-glare']: 0.3,
                scale: 1.03
            })
    }, [])

    return (
        <Card
            data-component={'component-load-more-card'}
            style={{ overflow: 'visible' }}
            ref={cardRef}
            onClick={onClick}
        >
            <FlexBox className={'load-more-card'}>
                <div className={'icon'}>
                    <Icon component={IconOxygenMore} />{' '}
                </div>
                <div className={'text'}>加载更多</div>
            </FlexBox>
        </Card>
    )
}

export default LoadMoreCard
