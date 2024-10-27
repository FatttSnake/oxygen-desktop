import { DetailedHTMLProps, HTMLAttributes } from 'react'
import '@/assets/css/components/common/flex-box.less'

interface FlexBoxProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    direction?: 'horizontal' | 'vertical'
    gap?: number
}

const FlexBox = forwardRef<HTMLDivElement, FlexBoxProps>(
    ({ className, direction, gap, style, ...props }, ref) => {
        return (
            <div
                className={`flex-box ${
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
