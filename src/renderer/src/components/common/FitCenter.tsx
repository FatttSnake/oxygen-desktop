import { DetailedHTMLProps, HTMLAttributes } from 'react'
import styles from '@/assets/css/components/common/fit-center.module.less'

interface FitCenterProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    vertical?: boolean
}

const FitCenter = ({ className, vertical, ...props }: FitCenterProps) => {
    return (
        <div
            className={`${styles.fitCenter}${className ? ` ${className}` : ''}${
                vertical ? ' flex-vertical' : ' flex-horizontal'
            }`}
            {...props}
        />
    )
}

export default FitCenter
