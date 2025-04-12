import { Children, PropsWithChildren } from 'react'
import useStyles from '$/assets/css/components/sidebar/group.style'

interface GroupProps {
    title: string
}

const Group = ({ title, children }: PropsWithChildren<GroupProps>) => {
    const { styles } = useStyles()

    return (
        <>
            {Children.count(children) ? <div className={styles.root}>{title}</div> : undefined}
            {children}
        </>
    )
}

export default Group
