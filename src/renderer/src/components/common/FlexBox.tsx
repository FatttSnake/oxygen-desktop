import { DetailedHTMLProps, HTMLAttributes } from 'react'
import useStyles from '@/assets/css/components/common/flex-box.style'

interface FlexBoxProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    direction?: 'horizontal' | 'vertical'
    gap?: number
}

const FlexBox = forwardRef<HTMLDivElement, FlexBoxProps>(
    ({ className, direction, gap, style, ...props }, ref) => {
        const { styles, cx } = useStyles()

        return (
            <div
                className={cx(
                    styles.flexBox,
                    className,
                    direction === 'horizontal' ? 'flex-horizontal' : 'flex-vertical'
                )}
                style={{ gap, ...style }}
                {...props}
                ref={ref}
            />
        )
    }
)

export default FlexBox
