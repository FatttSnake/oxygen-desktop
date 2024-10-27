import { DetailedHTMLProps, HTMLAttributes } from 'react'
import styles from '@/assets/css/components/common/card.module.less'

type CardProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>

const Card = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
    return (
        <div
            className={`${styles.cardBox}${className ? ` ${className}` : ''}`}
            {...props}
            ref={ref}
        />
    )
})

export default Card
