import FlexBox from '@/components/common/FlexBox'
import { IFiles, IImportMap } from '@/components/Playground/shared'
import Playground from '@/components/Playground'
import Transform from '@/components/Playground/Output/Transform'
import Preview from '@/components/Playground/Output/Preview'

interface OutputProps {
    isDarkMode?: boolean
    files: IFiles
    selectedFileName: string
    importMap: IImportMap
    entryPoint: string
    preExpansionCode?: string
    postExpansionCode?: string
    mobileMode?: boolean
    globalJsVariables?: Record<string, unknown>
    globalCssVariables?: string
}

const Output = ({
    isDarkMode,
    files,
    selectedFileName,
    importMap,
    entryPoint,
    preExpansionCode,
    postExpansionCode,
    mobileMode = false,
    globalJsVariables,
    globalCssVariables
}: OutputProps) => {
    const [selectedTab, setSelectedTab] = useState('Preview')

    return (
        <FlexBox>
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
                    mobileMode={mobileMode}
                    globalJsVariables={globalJsVariables}
                    globalCssVariables={globalCssVariables}
                />
            )}
            {selectedTab === 'Transform' && (
                <Transform isDarkMode={isDarkMode} file={files[selectedFileName]} />
            )}
        </FlexBox>
    )
}

Output.Preview = Preview
Output.Transform = Transform

export default Output
