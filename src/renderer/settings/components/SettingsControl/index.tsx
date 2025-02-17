import { PropsWithChildren, ReactNode } from 'react'
import useStyles from '%/assets/css/components/settings-control/index.style'
import FlexBox from '$/components/FlexBox'
import MaxWidthLayout from '$/components/MaxWidthLayout'
import Header from '%/components/SettingsControl/Header'
import Group from '%/components/SettingsControl/Group'
import Item from '%/components/SettingsControl/Item'

interface SettingsControlProps extends PropsWithChildren {
    maxWidth?: number
    header?: ReactNode
}

const SettingsControl = ({ maxWidth = 1000, header, children }: SettingsControlProps) => {
    const { styles, theme } = useStyles()

    return (
        <MaxWidthLayout maxWidth={maxWidth} minPadding={theme.paddingMD}>
            {header && <Header>{header}</Header>}
            <FlexBox className={styles.root}>{children}</FlexBox>
        </MaxWidthLayout>
    )
}

SettingsControl.Group = Group
SettingsControl.Item = Item

export default SettingsControl
