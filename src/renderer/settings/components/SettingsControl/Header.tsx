import { PropsWithChildren } from 'react'
import useStyles from '%/assets/css/components/settings-control/header.style'

const Header = ({ children }: PropsWithChildren) => {
    const { styles } = useStyles()

    return <div className={styles.root}>{children}</div>
}

export default Header
