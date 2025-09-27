import useStyles from '$/assets/css/components/playground/output/index.style'
import FlexBox from '$/components/FlexBox'
import { IFiles } from '$/components/Playground/shared'
import Playground from '$/components/Playground'
import Transform from '$/components/Playground/Output/Transform'

interface OutputProps {
    isDarkMode?: boolean
    files: IFiles
    selectedFileName: string
}

const Output = ({ isDarkMode, files, selectedFileName }: OutputProps) => {
    const { styles } = useStyles()
    const [selectedTab, setSelectedTab] = useState('Transform')

    return (
        <FlexBox className={styles.root}>
            <Playground.CodeEditor.FileSelector
                files={{
                    Transform: { name: 'Transform', language: 'json', value: '' }
                }}
                selectedFileName={selectedTab}
                onChange={(tabName) => {
                    setSelectedTab(tabName)
                    return true
                }}
                readonly
            />
            {selectedTab === 'Transform' && (
                <Transform isDarkMode={isDarkMode} file={files[selectedFileName]} />
            )}
        </FlexBox>
    )
}

Output.Transform = Transform

export default Output
