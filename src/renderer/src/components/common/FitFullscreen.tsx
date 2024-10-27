import { DetailedHTMLProps, HTMLAttributes } from 'react'
import styles from '@/assets/css/components/common/fit-fullscreen.module.less'

interface FitFullscreenProps
    extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    zIndex?: number
    backgroundColor?: string
}

const FitFullscreen = forwardRef<HTMLDivElement, FitFullscreenProps>(
    ({ zIndex, backgroundColor, className, style, ...props }, ref) => {
        return (
            <div
                className={`${styles.fitFullscreen}${className ? ` ${className}` : ''}`}
                style={{
                    zIndex,
                    backgroundColor,
                    ...style
                }}
                ref={ref}
                {...props}
            />
        )
    }
)

export default FitFullscreen
