import { createRoot } from 'react-dom/client'
import { editor, languages, Position } from 'monaco-editor'
import { Monaco } from '@monaco-editor/react'
import { MessageInstance } from 'antd/es/message/interface'
import { HookAPI } from 'antd/es/modal/useModal'
import { NotificationInstance } from 'antd/es/notification/interface'
import { css, AntdToken, Theme } from 'antd-style'
import { floor } from 'lodash'
import {
    STORAGE_COLLAPSE_SIDEBAR_KEY,
    STORAGE_THEME_MODE_KEY,
    STORAGE_TOOL_MENU_ITEM_KEY,
    THEME_DARK,
    THEME_FOLLOW_SYSTEM,
    THEME_LIGHT
} from '$/constants/common.constants'
import logo from '$/assets/logo.svg?url'
import { getLocalStorage, setLocalStorage } from '$/util/browser'
import FullscreenLoadingMask from '$/components/FullscreenLoadingMask'

export type ThemeMode = typeof THEME_FOLLOW_SYSTEM | typeof THEME_LIGHT | typeof THEME_DARK

let message: MessageInstance
let notification: NotificationInstance
let modal: HookAPI

export const init = (
    messageInstance: MessageInstance,
    notificationInstance: NotificationInstance,
    modalInstance: HookAPI
) => {
    message = messageInstance
    notification = notificationInstance
    modal = modalInstance
}

export { message, notification, modal }

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
    let precision: number
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

export const checkDesktop = () => import.meta.env.VITE_PLATFORM === 'DESKTOP'

export const saveToolMenuItem = (toolMenuItem: ToolMenuItem[]) => {
    setLocalStorage(STORAGE_TOOL_MENU_ITEM_KEY, JSON.stringify(toolMenuItem))
}

export const getToolMenuItem = (): ToolMenuItem[] => {
    const s = getLocalStorage(STORAGE_TOOL_MENU_ITEM_KEY)
    if (!s) {
        return []
    }
    return JSON.parse(s) as ToolMenuItem[]
}

export const omitText = (text: string, length: number) => {
    if (text.length <= length) {
        return text
    }
    return `${text.substring(0, length)}...`
}

const getByteLength = (str: string) => {
    let length = 0
    for (let i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 255) {
            length += 2
        } else {
            length++
        }
    }

    return length
}

const substringByByte = (str: string, start: number, length: number) => {
    let byteLength = 0
    let result = ''

    for (let i = 0; i < str.length; i++) {
        const charCode = str.charCodeAt(i)
        byteLength += charCode > 255 ? 2 : 1

        if (byteLength > start + length) {
            break
        } else if (byteLength > start) {
            result += str[i]
        }
    }

    return result
}

export const omitTextByByte = (text: string, length: number) => {
    if (getByteLength(text) <= length) {
        return text
    }
    return `${substringByByte(text, 0, length)}...`
}

export const getSidebarCollapse = () => getLocalStorage(STORAGE_COLLAPSE_SIDEBAR_KEY) === 'true'

export const setSidebarCollapse = (isCollapse: boolean) => {
    setLocalStorage(STORAGE_COLLAPSE_SIDEBAR_KEY, isCollapse ? 'true' : 'false')
}

export const getThemeMode = (): ThemeMode => {
    switch (getLocalStorage(STORAGE_THEME_MODE_KEY)) {
        case THEME_FOLLOW_SYSTEM:
        case THEME_LIGHT:
        case THEME_DARK:
            return getLocalStorage(STORAGE_THEME_MODE_KEY) as ThemeMode
        default:
            return THEME_FOLLOW_SYSTEM
    }
}

export const setThemeMode = (themeMode: ThemeMode) => {
    setLocalStorage(STORAGE_THEME_MODE_KEY, themeMode)
}

const cssColors = [
    'blue',
    'purple',
    'cyan',
    'green',
    'magenta',
    'pink',
    'red',
    'orange',
    'yellow',
    'volcano',
    'geekblue',
    'gold',
    'lime'
].reduce((prev: string[], current) => {
    let temp: string[] = []
    for (let i = 1; i <= 10; i++) {
        temp = [...temp, `${current}${i}`]
    }
    return [...prev, current, ...temp]
}, [])

const cssVariables: string[] = [
    ...cssColors,
    'colorPrimary',
    'colorSuccess',
    'colorWarning',
    'colorError',
    'colorInfo',
    'colorLink',
    'colorTextBase',
    'colorBgBase',
    'fontFamily',
    'fontFamilyCode',
    'fontSize',
    'lineWidth',
    'lineType',
    'motionUnit',
    'motionBase',
    'motionEaseOutCirc',
    'motionEaseInOutCirc',
    'motionEaseOut',
    'motionEaseInOut',
    'motionEaseOutBack',
    'motionEaseInBack',
    'motionEaseInQuint',
    'motionEaseOutQuint',
    'borderRadius',
    'sizeUnit',
    'sizeStep',
    'sizePopupArrow',
    'controlHeight',
    'zIndexBase',
    'zIndexPopupBase',
    'opacityImage',
    'colorLinkHover',
    'colorText',
    'colorTextSecondary',
    'colorTextTertiary',
    'colorTextQuaternary',
    'colorFill',
    'colorFillSecondary',
    'colorFillTertiary',
    'colorFillQuaternary',
    'colorBgSolid',
    'colorBgSolidHover',
    'colorBgSolidActive',
    'colorBgLayout',
    'colorBgContainer',
    'colorBgElevated',
    'colorBgSpotlight',
    'colorBgBlur',
    'colorBorder',
    'colorBorderSecondary',
    'colorPrimaryBg',
    'colorPrimaryBgHover',
    'colorPrimaryBorder',
    'colorPrimaryBorderHover',
    'colorPrimaryHover',
    'colorPrimaryActive',
    'colorPrimaryTextHover',
    'colorPrimaryText',
    'colorPrimaryTextActive',
    'colorSuccessBg',
    'colorSuccessBgHover',
    'colorSuccessBorder',
    'colorSuccessBorderHover',
    'colorSuccessHover',
    'colorSuccessActive',
    'colorSuccessTextHover',
    'colorSuccessText',
    'colorSuccessTextActive',
    'colorErrorBg',
    'colorErrorBgHover',
    'colorErrorBgFilledHover',
    'colorErrorBgActive',
    'colorErrorBorder',
    'colorErrorBorderHover',
    'colorErrorHover',
    'colorErrorActive',
    'colorErrorTextHover',
    'colorErrorText',
    'colorErrorTextActive',
    'colorWarningBg',
    'colorWarningBgHover',
    'colorWarningBorder',
    'colorWarningBorderHover',
    'colorWarningHover',
    'colorWarningActive',
    'colorWarningTextHover',
    'colorWarningText',
    'colorWarningTextActive',
    'colorInfoBg',
    'colorInfoBgHover',
    'colorInfoBorder',
    'colorInfoBorderHover',
    'colorInfoHover',
    'colorInfoActive',
    'colorInfoTextHover',
    'colorInfoText',
    'colorInfoTextActive',
    'colorLinkActive',
    'colorBgMask',
    'colorWhite',
    'fontSizeSM',
    'fontSizeLG',
    'fontSizeXL',
    'fontSizeHeading1',
    'fontSizeHeading2',
    'fontSizeHeading3',
    'fontSizeHeading4',
    'fontSizeHeading5',
    'lineHeight',
    'lineHeightLG',
    'lineHeightSM',
    'lineHeightHeading1',
    'lineHeightHeading2',
    'lineHeightHeading3',
    'lineHeightHeading4',
    'lineHeightHeading5',
    'sizeXXL',
    'sizeXL',
    'sizeLG',
    'sizeMD',
    'sizeMS',
    'size',
    'sizeSM',
    'sizeXS',
    'sizeXXS',
    'controlHeightSM',
    'controlHeightXS',
    'controlHeightLG',
    'motionDurationFast',
    'motionDurationMid',
    'motionDurationSlow',
    'lineWidthBold',
    'borderRadiusXS',
    'borderRadiusSM',
    'borderRadiusLG',
    'borderRadiusOuter',
    'colorFillContent',
    'colorFillContentHover',
    'colorFillAlter',
    'colorBgContainerDisabled',
    'colorBorderBg',
    'colorSplit',
    'colorTextPlaceholder',
    'colorTextDisabled',
    'colorTextHeading',
    'colorTextLabel',
    'colorTextDescription',
    'colorTextLightSolid',
    'colorHighlight',
    'colorBgTextHover',
    'colorBgTextActive',
    'colorIcon',
    'colorIconHover',
    'colorErrorOutline',
    'colorWarningOutline',
    'fontSizeIcon',
    'lineWidthFocus',
    'controlOutlineWidth',
    'controlInteractiveSize',
    'controlItemBgHover',
    'controlItemBgActive',
    'controlItemBgActiveHover',
    'controlItemBgActiveDisabled',
    'controlOutline',
    'fontWeightStrong',
    'opacityLoading',
    'linkDecoration',
    'linkHoverDecoration',
    'linkFocusDecoration',
    'controlPaddingHorizontal',
    'controlPaddingHorizontalSM',
    'paddingXXS',
    'paddingXS',
    'paddingSM',
    'padding',
    'paddingMD',
    'paddingLG',
    'paddingXL',
    'paddingContentHorizontalLG',
    'paddingContentVerticalLG',
    'paddingContentHorizontal',
    'paddingContentVertical',
    'paddingContentHorizontalSM',
    'paddingContentVerticalSM',
    'marginXXS',
    'marginXS',
    'marginSM',
    'margin',
    'marginMD',
    'marginLG',
    'marginXL',
    'marginXXL',
    'boxShadow',
    'boxShadowSecondary',
    'boxShadowTertiary',
    'screenXS',
    'screenXSMin',
    'screenXSMax',
    'screenSM',
    'screenSMMin',
    'screenSMMax',
    'screenMD',
    'screenMDMin',
    'screenMDMax',
    'screenLG',
    'screenLGMin',
    'screenLGMax',
    'screenXL',
    'screenXLMin',
    'screenXLMax',
    'screenXXL',
    'screenXXLMin'
]

export const generateThemeCssVariables = (theme: AntdToken) => {
    const cssContent = cssVariables
        .map((variable) => `--${variable}: ${theme[variable]};`)
        .join('\n')

    return css`
        :root {
            ${cssContent}
        }
    `
}

export const addExtraCssVariables = (monaco: Monaco) => {
    monaco.languages.registerCompletionItemProvider('css', {
        provideCompletionItems: (
            model: editor.ITextModel,
            position: Position
        ): languages.ProviderResult<languages.CompletionList> => {
            const textUntilPosition = model.getValueInRange({
                startLineNumber: 1,
                startColumn: 1,
                endLineNumber: position.lineNumber,
                endColumn: position.column
            })
            if (!textUntilPosition.match(/var\(([^)]*)$/)) {
                return { suggestions: [] }
            }

            const word = model.getWordUntilPosition(position)
            const range = new monaco.Range(
                position.lineNumber,
                word.startColumn,
                position.lineNumber,
                word.endColumn
            )

            return {
                suggestions: cssVariables.map(
                    (variable): languages.CompletionItem => ({
                        label: `--${variable}`,
                        kind: monaco.languages.CompletionItemKind.Variable,
                        insertText: `--${variable}`,
                        range,
                        detail: 'Oxygen Theme Variables'
                    })
                )
            }
        }
    })
}

export const removeUselessAttributes = (theme: Omit<Theme, 'prefixCls'>) => {
    const {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        Tree,
        appearance,
        browserPrefers,
        isDarkMode,
        setAppearance,
        setThemeMode,
        stylish,
        themeMode,
        wireframe,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        _tokenKey,
        ...result
    } = theme

    return result
}

export const setPageFavicon = (url?: string) => {
    const pageIcon: HTMLLinkElement | null = document.querySelector("link[rel*='icon']")
    pageIcon && (pageIcon.href = url ?? logo)
}

export const setPageTitle = (title: string) => {
    document.title = title
}
