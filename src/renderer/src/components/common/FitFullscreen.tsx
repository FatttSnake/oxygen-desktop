import { DetailedHTMLProps, HTMLAttributes } from 'react'
import useStyles from '@/assets/css/components/common/fit-fullscreen.style'

interface FitFullscreenProps
    extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    zIndex?: number
    backgroundColor?: string
}

const FitFullscreen = forwardRef<HTMLDivElement, FitFullscreenProps>(
    ({ zIndex, backgroundColor, className, style, ...props }, ref) => {
        const { styles, cx } = useStyles()

        return (
            <div
                className={cx(styles.fitFullscreen, className)}
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
