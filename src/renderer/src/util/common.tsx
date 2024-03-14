import { createRoot } from 'react-dom/client'
import FullscreenLoadingMask from '@/components/common/FullscreenLoadingMask'
import { floor } from 'lodash'

export const randomInt = (start: number, end: number) => {
    if (start > end) {
        const t = start
        start = end
        end = t
    }
    start = Math.ceil(start)
    end = Math.floor(end)
    return start + Math.floor(Math.random() * (end - start))
}

export const randomFloat = (start: number, end: number) => {
    return start + Math.random() * (end - start)
}

export const randomColor = (start: number, end: number) => {
    return `rgb(${randomInt(start, end)},${randomInt(start, end)},${randomInt(start, end)})`
}

export const floorNumber = (num: number, digits: number) => {
    if (digits > 0) {
        return Math.floor(num / Math.pow(10, digits - 1)) * Math.pow(10, digits - 1)
    } else {
        const regExpMatchArray = num.toString().match(new RegExp('^\\d\\.\\d{' + -digits + '}'))
        if (regExpMatchArray !== null) {
            return parseFloat(regExpMatchArray[0]).toFixed(-digits)
        } else {
            return num
        }
    }
}

export const showLoadingMask = (id: string) => {
    if (document.querySelector(`#${id}`)) {
        return
    }

    const container = document.createElement('div')
    document.body.appendChild(container)
    container.id = id
    container.setAttribute(
        'style',
        'position: fixed; width: 100vw; height: 100vh; z-index: 10000; left: 0; top: 0;'
    )

    return createRoot(container).render(<FullscreenLoadingMask />)
}

export const removeLoadingMask = (id: string) => {
    document.querySelectorAll(`#${id}`).forEach((value) => {
        value.parentNode?.removeChild(value)
    })
}

export enum ByteUnit {
    B = 'B',
    KiB = 'KiB',
    Mib = 'Mib',
    GiB = 'GiB',
    TiB = 'TiB',
    PiB = 'PiB',
    EiB = 'EiB',
    ZiB = 'ZiB',
    YiB = 'YiB'
}

export const formatByteSize = (byteSize: number): string => {
    const BASE = 1024
    if (byteSize <= -1) {
        return byteSize.toString()
    }

    if (floor(byteSize / BASE) <= 0) {
        return formatByte(byteSize, ByteUnit.B)
    }

    byteSize /= BASE
    if (floor(byteSize / BASE) <= 0) {
        return formatByte(byteSize, ByteUnit.KiB)
    }

    byteSize /= BASE
    if (floor(byteSize / BASE) <= 0) {
        return formatByte(byteSize, ByteUnit.Mib)
    }

    byteSize /= BASE
    if (floor(byteSize / BASE) <= 0) {
        return formatByte(byteSize, ByteUnit.GiB)
    }

    byteSize /= BASE
    if (floor(byteSize / BASE) <= 0) {
        return formatByte(byteSize, ByteUnit.TiB)
    }

    byteSize /= BASE
    if (floor(byteSize / BASE) <= 0) {
        return formatByte(byteSize, ByteUnit.PiB)
    }

    byteSize /= BASE
    if (floor(byteSize / BASE) <= 0) {
        return formatByte(byteSize, ByteUnit.EiB)
    }

    byteSize /= BASE
    if (floor(byteSize / BASE) <= 0) {
        return formatByte(byteSize, ByteUnit.ZiB)
    }

    byteSize /= BASE
    return formatByte(byteSize, ByteUnit.YiB)
}

const formatByte = (size: number, unit: ByteUnit): string => {
    let precision
    if ((size * 1000) % 10 > 0) {
        precision = 3
    } else if ((size * 100) % 10 > 0) {
        precision = 2
    } else if ((size * 10) % 10 > 0) {
        precision = 1
    } else {
        precision = 0
    }

    return `${size.toFixed(precision)}${unit}`
}
