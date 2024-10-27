import { DetailedHTMLProps, HTMLAttributes } from 'react'
import '@/assets/css/components/common/card.less'

type CardProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>

const Card = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
    return <div className={`card-box${className ? ` ${className}` : ''}`} {...props} ref={ref} />
})

export default Card
