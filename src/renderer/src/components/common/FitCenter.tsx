import { DetailedHTMLProps, HTMLAttributes } from 'react'
import useStyles from '@/assets/css/components/common/fit-center.style'

interface FitCenterProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    vertical?: boolean
}

const FitCenter = ({ className, vertical, ...props }: FitCenterProps) => {
    const { styles, cx } = useStyles()

    return (
        <div
            className={cx(
                styles.fitCenter,
                className,
                vertical ? ' flex-vertical' : ' flex-horizontal'
            )}
            {...props}
        />
    )
}

export default FitCenter
