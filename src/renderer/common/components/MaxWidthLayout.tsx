import { PropsWithChildren } from 'react'
import useStyles from '$/assets/css/components/max-width-layout.style'

interface MaxWidthLayoutProps {
    maxWidth: number
    minPadding?: number
}

const MaxWidthLayout = ({
    maxWidth,
    minPadding = 0,
    children
}: PropsWithChildren<MaxWidthLayoutProps>) => {
    const { styles } = useStyles({ maxWidth, minPadding })

    return <div className={styles.root}>{children}</div>
}

export default MaxWidthLayout
