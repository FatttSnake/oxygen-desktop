import { Dispatch, RefObject, SetStateAction } from 'react'
import { Node, NodeProps } from '@xyflow/react'
import useStyles from '@/components/Playground/Output/Preview/simulation.style'

export type SimulationData = {
    deviceWidth: number
    deviceHeight: number
    isRotate: boolean
    iframeKey: string
    iframeRef: RefObject<HTMLIFrameElement>
    iframeUrl: string
    setIsLoaded: Dispatch<SetStateAction<boolean>>
}

export type SimulationNode = Node<SimulationData, 'simulation'>

const Simulation = ({ data }: NodeProps<SimulationNode>) => {
    const { styles, cx } = useStyles()

    return (
        <div className={cx(styles.device, data.isRotate ? styles.rotate : '')}>
            <div
                className={cx(styles.deviceHeader, data.isRotate ? styles.rotatedDeviceHeader : '')}
            />
            <div
                className={cx(
                    styles.deviceContent,
                    data.isRotate ? styles.rotatedDeviceContent : ''
                )}
                style={{
                    width: data.isRotate ? data.deviceHeight : data.deviceWidth,
                    height: data.isRotate ? data.deviceWidth : data.deviceHeight
                }}
            >
                <iframe
                    className={styles.renderRoot}
                    key={data.iframeKey}
                    ref={data.iframeRef}
                    src={data.iframeUrl}
                    onLoad={() => data.setIsLoaded(true)}
                    sandbox="allow-downloads allow-forms allow-modals allow-scripts"
                    allow={'clipboard-read; clipboard-write'}
                />
            </div>
            <div
                className={cx(styles.deviceFooter, data.isRotate ? styles.rotatedDeviceFooter : '')}
            />
        </div>
    )
}

export default Simulation
