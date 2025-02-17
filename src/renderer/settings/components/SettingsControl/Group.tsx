import { PropsWithChildren, ReactNode } from 'react'
import useStyles from '%/assets/css/components/settings-control/group.style'
import FlexBox from '$/components/FlexBox'

interface GroupProps extends PropsWithChildren {
    title: ReactNode
}

const Group = ({ title, children }: GroupProps) => {
    const { styles } = useStyles()

    return (
        <FlexBox className={styles.root}>
            <div className={styles.title}>{title}</div>
            <FlexBox className={styles.content}>{children}</FlexBox>
        </FlexBox>
    )
}

export default Group
