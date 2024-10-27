import { DetailedHTMLProps, HTMLAttributes } from 'react'
import '@/assets/css/components/common/fit-center.less'

interface FitCenterProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    vertical?: boolean
}

const FitCenter = ({ className, vertical, ...props }: FitCenterProps) => {
    return (
        <div
            className={`fit-center${className ? ` ${className}` : ''}${
                vertical ? ' flex-vertical' : ' flex-horizontal'
            }`}
            {...props}
        />
    )
}

export default FitCenter
