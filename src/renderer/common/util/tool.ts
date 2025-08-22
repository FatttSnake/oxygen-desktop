import { editor, languages, Position } from 'monaco-editor'
import { Monaco } from '@monaco-editor/react'
import { AntdToken, css, Theme } from 'antd-style'
import { DATABASE_SELECT_SUCCESS, STORAGE_TOOL_MENU_ITEM_KEY } from '$/constants/common.constants'
import { getLocalStorage, setLocalStorage } from '$/util/browser'
import { r_tool_base_get_dist } from '$/services/tool'

export const saveToolMenuItem = (toolMenuItem: ToolMenuItem[]) => {
    setLocalStorage(STORAGE_TOOL_MENU_ITEM_KEY, JSON.stringify(toolMenuItem))
    oxygenApi.sidebar.menu.update()
}

export const getToolMenuItem = (): ToolMenuItem[] => {
    const s = getLocalStorage(STORAGE_TOOL_MENU_ITEM_KEY)
    if (!s) {
        return []
    }
    return JSON.parse(s) as ToolMenuItem[]
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

export const convertObjToJsLiteral = (obj: unknown) => {
    const isValidIdentifier = (key: string) => /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)
    const parseValue = (value: unknown) => {
        if (typeof value === 'string') {
            return JSON.stringify(value)
        } else if (typeof value === 'number' || typeof value === 'boolean') {
            return String(value)
        } else if (value === null) {
            return 'null'
        } else if (Array.isArray(value)) {
            const elements = value.map((item) => parseValue(item))
            return `[${elements.join(', ')}]`
        } else if (typeof value === 'object') {
            const entries = Object.entries(value).map(([key, val]) => {
                const formattedKey = isValidIdentifier(key) ? key : JSON.stringify(key)
                return `${formattedKey}: ${parseValue(val)}`
            })
            return `{${entries.join(', ')}}`
        }
        return ''
    }
    return parseValue(obj)
}

export const processBaseDist = async <T>(baseId: string, baseVersion: number, obj: T) => {
    const res = await r_tool_base_get_dist(baseId, baseVersion)
    const response = res.data

    if (response.code === DATABASE_SELECT_SUCCESS) {
        return {
            ...obj,
            toolBaseVo: response.data!
        }
    }

    throw Error(response.msg)
}

export const formatToolBaseVersion = (version: number) =>
    version
        ? `v${Number((version / 1e3).toFixed(0))
              .toString(16)
              .toUpperCase()}`
        : '草稿'
