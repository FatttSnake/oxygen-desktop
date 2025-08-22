import { PropsWithChildren, ReactNode } from 'react'
import Icon from '@ant-design/icons'
import useStyles from '@/assets/css/components/tools/tool-bar.style'
import Card from '$/components/Card'
import FlexBox from '$/components/FlexBox'

interface ToolBarProps extends PropsWithChildren {
    title?: ReactNode
    subtitle?: ReactNode
    onBack?: () => void
}

const ToolBar = ({ title, subtitle, onBack, children }: ToolBarProps) => {
    const { styles } = useStyles()

    return (
        <Card className={styles.root}>
            <div className={styles.content}>
                <FlexBox className={styles.left} direction={'horizontal'}>
                    {onBack && (
                        <AntdButton
                            color={'default'}
                            variant={'link'}
                            size={'small'}
                            icon={<Icon component={IconOxygenBack} />}
                            onClick={onBack}
                        />
                    )}
                    <span className={styles.title}>{title}</span>
                    {subtitle}
                </FlexBox>
                <FlexBox className={styles.right} direction={'horizontal'}>
                    {children}
                </FlexBox>
            </div>
        </Card>
    )
}

export default ToolBar
