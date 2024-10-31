import Icon from '@ant-design/icons'
import { Background, Controls, MiniMap, Node, Panel, ReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { AppContext } from '@/App'
import useStyles from '@/components/Playground/Output/Preview/render.style'
import iframeRaw from '@/components/Playground/Output/Preview/iframe.html?raw'
import devices, { DeviceName } from '@/components/Playground/Output/Preview/devices'
import Simulation, { SimulationData } from '@/components/Playground/Output/Preview/Simulation'

interface RenderProps {
    iframeKey: string
    compiledCode: string
    mobileMode?: boolean
}

interface IMessage {
    type: 'LOADED' | 'ERROR' | 'UPDATE' | 'DONE'
    msg: string
    data: {
        compiledCode?: string
        zoom?: number
    }
}

const getIframeUrl = (iframeRaw: string) => {
    return URL.createObjectURL(new Blob([iframeRaw], { type: 'text/html' }))
}

const iframeUrl = getIframeUrl(iframeRaw)

const Render = ({ iframeKey, compiledCode, mobileMode = false }: RenderProps) => {
    const { styles, theme } = useStyles()
    const { isDarkMode } = useContext(AppContext)
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const [selectedDevice, setSelectedDevice] = useState<DeviceName>('Pixel 7')
    const [isRotate, setIsRotate] = useState(false)

    const nodes: Node<SimulationData>[] = [
        {
            id: 'device',
            type: 'simulation',
            position: { x: 0, y: 0 },
            data: {
                deviceWidth: devices[selectedDevice].width,
                deviceHeight: devices[selectedDevice].height,
                isRotate,
                iframeKey,
                iframeRef,
                iframeUrl,
                setIsLoaded
            }
        }
    ]

    const handleOnRotateDevice = () => {
        setIsRotate(!isRotate)
    }

    useEffect(() => {
        if (isLoaded) {
            iframeRef.current?.contentWindow?.postMessage(
                {
                    type: 'UPDATE',
                    data: { compiledCode }
                } as IMessage,
                '*'
            )
        }
    }, [isLoaded, compiledCode])

    return mobileMode ? (
        <>
            <ReactFlow
                colorMode={isDarkMode ? 'dark' : 'light'}
                nodeTypes={{ simulation: Simulation }}
                nodes={nodes}
                proOptions={{ hideAttribution: true }}
                fitView
            >
                <Background bgColor={theme.colorBgLayout} />
                <MiniMap bgColor={theme.colorBgMask} zoomStep={1} pannable zoomable />
                <Controls />
                <Panel>
                    <AntdSpace>
                        <AntdSelect
                            size={'small'}
                            options={Object.values(devices).map((item) => ({
                                label: item.name,
                                value: item.name
                            }))}
                            value={selectedDevice}
                            onChange={setSelectedDevice}
                        />
                        <AntdButton
                            size={'small'}
                            title={'旋转屏幕'}
                            onClick={handleOnRotateDevice}
                            icon={
                                <Icon
                                    component={
                                        isRotate ? IconOxygenRotateRight : IconOxygenRotateLeft
                                    }
                                />
                            }
                        />
                    </AntdSpace>
                </Panel>
            </ReactFlow>
        </>
    ) : (
        <iframe
            className={styles.renderRoot}
            key={iframeKey}
            ref={iframeRef}
            src={iframeUrl}
            onLoad={() => setIsLoaded(true)}
            sandbox={'allow-downloads allow-forms allow-modals allow-scripts'}
            allow={'clipboard-read; clipboard-write'}
        />
    )
}

export default Render
