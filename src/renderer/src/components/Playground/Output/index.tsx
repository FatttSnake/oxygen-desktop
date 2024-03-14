import FlexBox from '@/components/common/FlexBox'
import { IFiles, IImportMap } from '@/components/Playground/shared'
import Playground from '@/components/Playground'
import Transform from '@/components/Playground/Output/Transform'
import Preview from '@/components/Playground/Output/Preview'

interface OutputProps {
    files: IFiles
    selectedFileName: string
    importMap: IImportMap
    entryPoint: string
    preExpansionCode?: string
    postExpansionCode?: string
}

const Output = ({
    files,
    selectedFileName,
    importMap,
    entryPoint,
    preExpansionCode,
    postExpansionCode
}: OutputProps) => {
    const [selectedTab, setSelectedTab] = useState('Preview')

    return (
        <FlexBox data-component={'playground-code-output'}>
            <Playground.CodeEditor.FileSelector
                files={{
                    Preview: { name: 'Preview', language: 'json', value: '' },
                    Transform: { name: 'Transform', language: 'json', value: '' }
                }}
                selectedFileName={selectedTab}
                onChange={(tabName) => setSelectedTab(tabName)}
                readonly
            />
            {selectedTab === 'Preview' && (
                <Preview
                    iframeKey={JSON.stringify(importMap)}
                    files={files}
                    importMap={importMap}
                    entryPoint={entryPoint}
                    preExpansionCode={preExpansionCode}
                    postExpansionCode={postExpansionCode}
                />
            )}
            {selectedTab === 'Transform' && <Transform file={files[selectedFileName]} />}
        </FlexBox>
    )
}

Output.Preview = Preview
Output.Transform = Transform

export default Output
