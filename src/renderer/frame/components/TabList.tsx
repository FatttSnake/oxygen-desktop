import { ReactNode } from 'react'
import useStyles from '#/assets/css/components/tab-list.style'
import HideScrollbar from '$/components/HideScrollbar'
import TabItem from '#/components/TabItem.tsx'
import TabSeparate from '#/components/TabSeparate.tsx'

interface Tab {
    icon?: IconComponent | string
    title: ReactNode
}

interface TabListProps {
    pinTabs?: Tab[]
    tabs: Tab[]
}

const TabList = ({ pinTabs, tabs }: TabListProps) => {
    const { styles } = useStyles()

    return (
        <HideScrollbar isShowVerticalScrollbar={false}>
            <div className={styles.root}>
                <TabSeparate />
                {pinTabs?.map((tab) => (
                    <>
                        <TabItem icon={IconOxygenLogo} pin active>
                            {tab.title}
                        </TabItem>
                        <TabSeparate />
                    </>
                ))}
                {tabs.map((tab) => (
                    <>
                        <TabItem>{tab.title}</TabItem>
                        <TabSeparate />
                    </>
                ))}
            </div>
        </HideScrollbar>
    )
}

export default TabList
