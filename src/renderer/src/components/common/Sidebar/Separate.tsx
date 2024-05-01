import { DetailedHTMLProps, HTMLAttributes } from 'react'

const Separate = ({
    className,
    ...props
}: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => {
    return <div className={`separate${className ? ` ${className}` : ''}`} {...props} />
}

export default Separate
