import { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react'
import Icon from '@ant-design/icons'
import VanillaTilt, { TiltOptions } from 'vanilla-tilt'
import '@/assets/css/components/system/system-card.scss'
import Card from '@/components/common/Card'
import FlexBox from '@/components/common/FlexBox'

interface SystemCardProps
    extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    icon: IconComponent
    description?: ReactNode
    options?: TiltOptions
    url?: string
}

const SystemCard = forwardRef<HTMLDivElement, SystemCardProps>(
    ({
        style,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ref,
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
    }) => {
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
                data-component={'component-system-card'}
                style={{ overflow: 'visible', ...style }}
                ref={cardRef}
                {...props}
                onClick={handleCardOnClick}
            >
                <FlexBox className={'system-card'}>
                    <Icon component={icon} className={'icon'} />
                    <div className={'text'}>{children}</div>
                    <div className={'description'}>{description}</div>
                </FlexBox>
            </Card>
        )
    }
)

export default SystemCard
