import { nativeImage } from 'electron'
import { Resvg } from '@resvg/resvg-js'

export const svgToNativeImage = (svgDataUrl: string) => {
    const base64Data = svgDataUrl.replace(/^data:image\/svg\+xml;base64,/, '')
    const svgString = Buffer.from(base64Data, 'base64').toString('utf-8')

    const resvg = new Resvg(svgString)
    const pngData = resvg.render()
    const pngBuffer = pngData.asPng()

    return nativeImage.createFromBuffer(pngBuffer)
}
