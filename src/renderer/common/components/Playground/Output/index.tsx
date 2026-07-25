import useStyles from '$/assets/css/components/playground/output/index.style'
import FlexBox from '$/components/FlexBox'
import { IFileTree } from '$/components/Playground/shared'
import { findNodeByKey } from '$/components/Playground/files'
import Transform from '$/components/Playground/Output/Transform'
import TabBar from '$/components/Playground/TabBar'

interface OutputProps {
    isDarkMode?: boolean
    fileTree: IFileTree
    selectedFileKey: string
}

const Output = ({ isDarkMode, fileTree, selectedFileKey }: OutputProps) => {
    const { styles } = useStyles()
    const [selectedTabKey, setSelectedTabKey] = useState('Transform')

    return (
        <FlexBox className={styles.root}>
            <TabBar
                tabs={[{ key: 'Transform', name: 'Transform', closable: false, editable: false }]}
                creatable={false}
                selectedTabKey={selectedTabKey}
                onChange={(tabName) => {
                    setSelectedTabKey(tabName)
                    return true
                }}
            />
            {selectedTabKey === 'Transform' && (
                <Transform
                    isDarkMode={isDarkMode}
                    file={findNodeByKey(fileTree, selectedFileKey)?.node}
                />
            )}
        </FlexBox>
    )
}

Output.Transform = Transform

export default Output
