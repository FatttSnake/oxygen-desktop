import { DetailedHTMLProps, HTMLAttributes } from 'react'
import styles from '@/assets/css/components/common/flex-box.module.less'

interface FlexBoxProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    direction?: 'horizontal' | 'vertical'
    gap?: number
}

const FlexBox = forwardRef<HTMLDivElement, FlexBoxProps>(
    ({ className, direction, gap, style, ...props }, ref) => {
        return (
            <div
                className={`${styles.flexBox} ${
                    direction === 'horizontal' ? 'flex-horizontal' : 'flex-vertical'
                }${className ? ` ${className}` : ''}`}
                style={{ gap, ...style }}
                {...props}
                ref={ref}
            />
        )
    }
)

export default FlexBox
