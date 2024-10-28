import { DetailedHTMLProps, HTMLAttributes } from 'react'
import useStyles from '@/assets/css/components/common/card.style'

type CardProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>

const Card = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
    const { styles, cx } = useStyles()

    return <div className={cx(styles.cardBox, className)} {...props} ref={ref} />
})

export default Card
