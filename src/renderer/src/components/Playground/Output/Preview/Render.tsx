import { ChangeEvent } from 'react'
import styles from '@/components/Playground/Output/Preview/render.module.less'
import { COLOR_FONT_MAIN } from '@/constants/common.constants'
import iframeRaw from '@/components/Playground/Output/Preview/iframe.html?raw'
import HideScrollbar from '@/components/common/HideScrollbar'

interface RenderProps {
    iframeKey: string
    compiledCode: string
    mobileMode?: boolean
}

interface IMessage {
    type: 'LOADED' | 'ERROR' | 'UPDATE' | 'DONE' | 'SCALE'
    msg: string
    data: {
        compiledCode?: string
        zoom?: number
    }
}

interface IDevice {
    name: string
    width: number
    height: number
}

const getIframeUrl = (iframeRaw: string) => {
    const shimsUrl = '//unpkg.com/es-module-shims/dist/es-module-shims.js'
    // 判断浏览器是否支持esm ，不支持esm就引入es-module-shims
    const newIframeRaw =
        typeof import.meta === 'undefined'
            ? iframeRaw.replace(
                  '<!-- es-module-shims -->',
                  `<script async src="${shimsUrl}"></script>`
              )
            : iframeRaw
    return URL.createObjectURL(new Blob([newIframeRaw], { type: 'text/html' }))
}

const iframeUrl = getIframeUrl(iframeRaw)

const Render = ({ iframeKey, compiledCode, mobileMode = false }: RenderProps) => {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const [selectedDevice, setSelectedDevice] = useState('Pixel 7')
    const [zoom, setZoom] = useState(1)
    const [isRotate, setIsRotate] = useState(false)

    const devices: IDevice[] = [
        {
            name: 'iPhone SE',
            width: 375,
            height: 667
        },
        {
            name: 'iPhone XR',
            width: 414,
            height: 896
        },
        {
            name: 'iPhone 12 Pro',
            width: 390,
            height: 844
        },
        {
            name: 'iPhone 14 Pro Max',
            width: 430,
            height: 932
        },
        {
            name: 'Pixel 7',
            width: 412,
            height: 915
        },
        {
            name: 'Samsung Galaxy S8+',
            width: 360,
            height: 740
        },
        {
            name: 'Samsung Galaxy S20 Ultra',
            width: 412,
            height: 915
        },
        {
            name: 'iPad Mini',
            width: 768,
            height: 1024
        },
        {
            name: 'iPad Air',
            width: 820,
            height: 1180
        },
        {
            name: 'iPad Pro',
            width: 1024,
            height: 1366
        },
        {
            name: 'Surface Pro 7',
            width: 912,
            height: 1368
        },
        {
            name: 'Surface Duo',
            width: 540,
            height: 720
        },
        {
            name: 'Galaxy Fold',
            width: 280,
            height: 653
        },
        {
            name: 'Asus Zenbook Fold',
            width: 853,
            height: 1280
        },
        {
            name: 'Samsung Galaxy A51/71',
            width: 412,
            height: 914
        },
        {
            name: 'Nest Hub',
            width: 1024,
            height: 600
        },
        {
            name: 'Nest Hub Max',
            width: 1280,
            height: 800
        }
    ]

    const handleOnChangeDevice = (e: ChangeEvent<HTMLSelectElement>) => {
        setSelectedDevice(e.target.value)
    }

    const handleOnChangeZoom = (e: ChangeEvent<HTMLInputElement>) => {
        setZoom(Number(e.target.value))
    }

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

    useEffect(() => {
        if (isLoaded) {
            iframeRef.current?.contentWindow?.postMessage(
                {
                    type: 'SCALE',
                    data: { zoom: zoom }
                } as IMessage,
                '*'
            )
        }
    }, [isLoaded, zoom])

    return mobileMode ? (
        <>
            <HideScrollbar
                className={styles.mobileModeRoot}
                isShowVerticalScrollbar
                isShowHorizontalScrollbar
                autoHideWaitingTime={1000}
            >
                <div className={styles.mobileModeContent} style={{ zoom }}>
                    <div className={`${styles.device}${isRotate ? ` ${styles.rotate}` : ''}`}>
                        <div
                            className={`${styles.deviceHeader}${isRotate ? ` ${styles.rotate}` : ''}`}
                        />
                        <div
                            className={`${styles.deviceContent}${isRotate ? ` ${styles.rotate}` : ''}`}
                            style={{
                                width: isRotate
                                    ? (devices.find((value) => value.name === selectedDevice)
                                          ?.height ?? 915)
                                    : (devices.find((value) => value.name === selectedDevice)
                                          ?.width ?? 412),
                                height: isRotate
                                    ? (devices.find((value) => value.name === selectedDevice)
                                          ?.width ?? 412)
                                    : (devices.find((value) => value.name === selectedDevice)
                                          ?.height ?? 915)
                            }}
                        >
                            <iframe
                                className={styles.renderRoot}
                                key={iframeKey}
                                ref={iframeRef}
                                src={iframeUrl}
                                onLoad={() => setIsLoaded(true)}
                                sandbox="allow-downloads allow-forms allow-modals allow-scripts"
                                allow={'clipboard-read; clipboard-write'}
                            />
                        </div>
                        <div
                            className={`${styles.deviceFooter}${isRotate ? ` ${styles.rotate}` : ''}`}
                        />
                    </div>
                </div>
            </HideScrollbar>

            <div className={styles.switchDevice}>
                <IconOxygenMobile fill={COLOR_FONT_MAIN} />
                <select value={selectedDevice} onChange={handleOnChangeDevice}>
                    {devices.map((value) => (
                        <option value={value.name}>{value.name}</option>
                    ))}
                </select>
                <div title={'旋转屏幕'} onClick={handleOnRotateDevice}>
                    {isRotate ? (
                        <IconOxygenRotateRight fill={COLOR_FONT_MAIN} />
                    ) : (
                        <IconOxygenRotateLeft fill={COLOR_FONT_MAIN} />
                    )}
                </div>
            </div>
            <div className={styles.switchZoom}>
                <IconOxygenZoom fill={COLOR_FONT_MAIN} />
                <input
                    type={'range'}
                    min={0.5}
                    max={2}
                    step={0.1}
                    value={zoom}
                    onChange={handleOnChangeZoom}
                />
            </div>
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
