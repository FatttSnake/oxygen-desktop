import VanillaTilt from 'vanilla-tilt'
import Icon from '@ant-design/icons'
import useStyles from '@/assets/css/components/tools/load-more-card.style'
import FlexBox from '@/components/common/FlexBox'
import Card from '@/components/common/Card'

interface LoadMoreCardProps {
    onClick: () => void
}

const LoadMoreCard = ({ onClick }: LoadMoreCardProps) => {
    const { styles } = useStyles()
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
        <Card ref={cardRef} onClick={onClick}>
            <FlexBox className={styles.root}>
                <div className={styles.icon}>
                    <Icon component={IconOxygenMore} />{' '}
                </div>
                <div className={styles.text}>加载更多</div>
            </FlexBox>
        </Card>
    )
}

export default LoadMoreCard
