import { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react'
import Icon from '@ant-design/icons'
import VanillaTilt, { TiltOptions } from 'vanilla-tilt'
import styles from '@/assets/css/components/common/url-card.module.less'
import Card from '@/components/common/Card'
import FlexBox from '@/components/common/FlexBox'

interface UrlCardProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    icon: IconComponent
    description?: ReactNode
    options?: TiltOptions
    url?: string
}

const UrlCard = ({
    style,
    icon,
    description,
    options = {
        reverse: true,
        max: 8,
        glare: true,
        scale: 1.03
    },
    url,
    children,
    ...props
}: UrlCardProps) => {
    const navigate = useNavigate()
    const cardRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        cardRef.current && VanillaTilt.init(cardRef.current, options)
    }, [options])

    const handleCardOnClick = () => {
        url && navigate(url)
    }

    return (
        <Card
            className={styles.root}
            style={{ overflow: 'visible', ...style }}
            {...props}
            ref={cardRef}
            onClick={handleCardOnClick}
        >
            <FlexBox className={styles.urlCard}>
                <Icon component={icon} className={styles.icon} />
                <div className={styles.text}>{children}</div>
                <div>{description}</div>
            </FlexBox>
        </Card>
    )
}

export default UrlCard
