import VanillaTilt from 'vanilla-tilt'
import Icon from '@ant-design/icons'
import styles from '@/assets/css/components/tools/load-more-card.module.less'
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
            className={styles.root}
            style={{ overflow: 'visible' }}
            ref={cardRef}
            onClick={onClick}
        >
            <FlexBox className={styles.loadMoreCard}>
                <div className={styles.icon}>
                    <Icon component={IconOxygenMore} />{' '}
                </div>
                <div className={styles.text}>加载更多</div>
            </FlexBox>
        </Card>
    )
}

export default LoadMoreCard
