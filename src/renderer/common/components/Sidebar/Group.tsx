import { Children, PropsWithChildren } from 'react'
import useStyles from '$/assets/css/components/sidebar/group.style'

interface GroupProps extends PropsWithChildren {
    title: string
}

const Group = ({ title, children }: GroupProps) => {
    const { styles } = useStyles()

    return (
        <>
            {Children.count(children) ? <div className={styles.root}>{title}</div> : undefined}
            {children}
        </>
    )
}

export default Group
