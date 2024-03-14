import { DetailedHTMLProps, HTMLAttributes } from 'react'
import '@/assets/css/components/common/fit-fullscreen.scss'

interface FitFullscreenProps
    extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    zIndex?: number
    backgroundColor?: string
}

const FitFullscreen = forwardRef<HTMLDivElement, FitFullscreenProps>(
    ({ zIndex, backgroundColor, className, style, ...props }, ref) => {
        return (
            <div
                className={`fit-fullscreen${className ? ` ${className}` : ''}`}
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
