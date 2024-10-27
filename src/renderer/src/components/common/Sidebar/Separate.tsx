import { DetailedHTMLProps, HTMLAttributes } from 'react'
import styles from '@/assets/css/components/common/sidebar.module.less'

const Separate = ({
    className,
    ...props
}: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => {
    return <div className={`${styles.separate}${className ? ` ${className}` : ''}`} {...props} />
}

export default Separate
