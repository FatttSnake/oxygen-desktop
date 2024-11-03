interface Window {
    /**
     * Initialization tool.\
     * This method must be implemented to run the tool.
     */
    initOxygenTool: (id: string) => void
}

/**
 * Oxygen Theme Variable
 */
declare const OxygenTheme: Theme

interface Theme extends AliasToken {
    isDarkMode: boolean
}

interface AliasToken extends MapToken {
    /**
     * @nameZH 内容区域背景色（悬停）
     * @nameEN Background color of content area (hover)
     * @desc 控制内容区域背景色在鼠标悬停时的样式。
     * @descEN Control the style of background color of content area when mouse hovers over it.
     */
    colorFillContentHover: string
    /**
     * @nameZH 替代背景色
     * @nameEN Alternative background color
     * @desc 控制元素替代背景色。
     * @descEN Control the alternative background color of element.
     */
    colorFillAlter: string
    /**
     * @nameZH 内容区域背景色
     * @nameEN Background color of content area
     * @desc 控制内容区域的背景色。
     * @descEN Control the background color of content area.
     */
    colorFillContent: string
    /**
     * @nameZH 容器禁用态下的背景色
     * @nameEN Disabled container background color
     * @desc 控制容器在禁用状态下的背景色。
     * @descEN Control the background color of container in disabled state.
     */
    colorBgContainerDisabled: string
    /**
     * @nameZH 文本悬停态背景色
     * @nameEN Text hover background color
     * @desc 控制文本在悬停状态下的背景色。
     * @descEN Control the background color of text in hover state.
     */
    colorBgTextHover: string
    /**
     * @nameZH 文本激活态背景色
     * @nameEN Text active background color
     * @desc 控制文本在激活状态下的背景色。
     * @descEN Control the background color of text in active state.
     */
    colorBgTextActive: string
    /**
     * @nameZH 背景边框颜色
     * @nameEN Background border color
     * @desc 控制元素背景边框的颜色。
     * @descEN Control the color of background border of element.
     */
    colorBorderBg: string
    /**
     * @nameZH 分割线颜色
     * @nameEN Separator Color
     * @desc 用于作为分割线的颜色，此颜色和 colorBorderSecondary 的颜色一致，但是用的是透明色。
     * @descEN Used as the color of separator, this color is the same as colorBorderSecondary but with transparency.
     */
    colorSplit: string
    /**
     * @nameZH 占位文本颜色
     * @nameEN Placeholder Text Color
     * @desc 控制占位文本的颜色。
     * @descEN Control the color of placeholder text.
     */
    colorTextPlaceholder: string
    /**
     * @nameZH 禁用字体颜色
     * @nameEN Disabled Text Color
     * @desc 控制禁用状态下的字体颜色。
     * @descEN Control the color of text in disabled state.
     */
    colorTextDisabled: string
    /**
     * @nameZH 标题字体颜色
     * @nameEN Heading Text Color
     * @desc 控制标题字体颜色。
     * @descEN Control the font color of heading.
     */
    colorTextHeading: string
    /**
     * @nameZH 文本标签字体颜色
     * @nameEN Text label font color
     * @desc 控制文本标签字体颜色。
     * @descEN Control the font color of text label.
     */
    colorTextLabel: string
    /**
     * @nameZH 文本描述字体颜色
     * @nameEN Text description font color
     * @desc 控制文本描述字体颜色。
     * @descEN Control the font color of text description.
     */
    colorTextDescription: string
    /**
     * @nameZH 固定文本高亮颜色
     * @nameEN Fixed text highlight color
     * @desc 控制带背景色的文本，例如 Primary Button 组件中的文本高亮颜色。
     * @descEN Control the highlight color of text with background color, such as the text in Primary Button components.
     */
    colorTextLightSolid: string
    /**
     /**
     * @nameZH 弱操作图标颜色
     * @nameEN Weak action icon color
     * @desc 控制弱操作图标的颜色，例如 allowClear 或 Alert 关闭按钮。
     * @descEN Weak action. Such as `allowClear` or Alert close button
     */
    colorIcon: string
    /**  */
    /**
     * @nameZH 弱操作图标悬浮态颜色
     * @nameEN Weak action icon hover color
     * @desc 控制弱操作图标在悬浮状态下的颜色，例如 allowClear 或 Alert 关闭按钮。
     * @descEN Weak action hover color. Such as `allowClear` or Alert close button
     */
    colorIconHover: string
    /**
     * @nameZH 高亮颜色
     * @nameEN Highlight color
     * @desc 控制页面元素高亮时的颜色。
     * @descEN Control the color of page element when highlighted.
     */
    colorHighlight: string
    /**
     * @nameZH 输入组件的 Outline 颜色
     * @nameEN Input component outline color
     * @desc 控制输入组件的外轮廓线颜色。
     * @descEN Control the outline color of input component.
     */
    controlOutline: string
    /**
     * @nameZH 警告状态下的 Outline 颜色
     * @nameEN Warning outline color
     * @desc 控制输入组件警告状态下的外轮廓线颜色。
     * @descEN Control the outline color of input component in warning state.
     */
    colorWarningOutline: string
    /**
     * @nameZH 错误状态下的 Outline 颜色
     * @nameEN Error outline color
     * @desc 控制输入组件错误状态下的外轮廓线颜色。
     * @descEN Control the outline color of input component in error state.
     */
    colorErrorOutline: string
    /**
     * @nameZH 选择器、级联选择器等中的操作图标字体大小
     * @nameEN Operation icon font size in Select, Cascader, etc.
     * @desc 控制选择器、级联选择器等中的操作图标字体大小。正常情况下与 fontSizeSM 相同。
     * @descEN Control the font size of operation icon in Select, Cascader, etc. Normally same as fontSizeSM.
     */
    fontSizeIcon: number
    /**
     * @nameZH 标题类组件（如 h1、h2、h3）或选中项的字体粗细
     * @nameEN Font weight for heading components (such as h1, h2, h3) or selected item
     * @desc 控制标题类组件（如 h1、h2、h3）或选中项的字体粗细。
     * @descEN Control the font weight of heading components (such as h1, h2, h3) or selected item.
     */
    fontWeightStrong: number
    /**
     * @nameZH 输入组件的外轮廓线宽度
     * @nameEN Input component outline width
     * @desc 控制输入组件的外轮廓线宽度。
     * @descEN Control the outline width of input component.
     */
    controlOutlineWidth: number
    /**
     * @nameZH 控制组件项在鼠标悬浮时的背景颜色
     * @nameEN Background color of control component item when hovering
     * @desc 控制组件项在鼠标悬浮时的背景颜色。
     * @descEN Control the background color of control component item when hovering.
     */
    controlItemBgHover: string
    /**
     * @nameZH 控制组件项在激活状态下的背景颜色
     * @nameEN Background color of control component item when active
     * @desc 控制组件项在激活状态下的背景颜色。
     * @descEN Control the background color of control component item when active.
     */
    controlItemBgActive: string
    /**
     * @nameZH 控制组件项在鼠标悬浮且激活状态下的背景颜色
     * @nameEN Background color of control component item when hovering and active
     * @desc 控制组件项在鼠标悬浮且激活状态下的背景颜色。
     * @descEN Control the background color of control component item when hovering and active.
     */
    controlItemBgActiveHover: string
    /**
     * @nameZH 控制组件的交互大小
     * @nameEN Interactive size of control component
     * @desc 控制组件的交互大小。
     * @descEN Control the interactive size of control component.
     */
    controlInteractiveSize: number
    /**
     * @nameZH 控制组件项在禁用状态下的激活背景颜色
     * @nameEN Background color of control component item when active and disabled
     * @desc 控制组件项在禁用状态下的激活背景颜色。
     * @descEN Control the background color of control component item when active and disabled.
     */
    controlItemBgActiveDisabled: string
    /**
     * @nameZH 线条宽度(聚焦态)
     * @nameEN Line width(focus state)
     * @desc 控制线条的宽度，当组件处于聚焦态时。
     * @descEN Control the width of the line when the component is in focus state.
     */
    lineWidthFocus: number
    /**
     * @nameZH 极小内间距
     * @nameEN Extra extra small padding
     * @desc 控制元素的极小内间距。
     * @descEN Control the extra extra small padding of the element.
     */
    paddingXXS: number
    /**
     * @nameZH 特小内间距
     * @nameEN Extra small padding
     * @desc 控制元素的特小内间距。
     * @descEN Control the extra small padding of the element.
     */
    paddingXS: number
    /**
     * @nameZH 小内间距
     * @nameEN Small padding
     * @desc 控制元素的小内间距。
     * @descEN Control the small padding of the element.
     */
    paddingSM: number
    /**
     * @nameZH 内间距
     * @nameEN Padding
     * @desc 控制元素的内间距。
     * @descEN Control the padding of the element.
     */
    padding: number
    /**
     * @nameZH 中等内间距
     * @nameEN Medium padding
     * @desc 控制元素的中等内间距。
     * @descEN Control the medium padding of the element.
     */
    paddingMD: number
    /**
     * @nameZH 大内间距
     * @nameEN Large padding
     * @desc 控制元素的大内间距。
     * @descEN Control the large padding of the element.
     */
    paddingLG: number
    /**
     * @nameZH 特大内间距
     * @nameEN Extra large padding
     * @desc 控制元素的特大内间距。
     * @descEN Control the extra large padding of the element.
     */
    paddingXL: number
    /**
     * @nameZH 内容水平内间距（LG）
     * @nameEN Content horizontal padding (LG)
     * @desc 控制内容元素水平内间距，适用于大屏幕设备。
     * @descEN Control the horizontal padding of content element, suitable for large screen devices.
     */
    paddingContentHorizontalLG: number
    /**
     * @nameZH 内容水平内间距
     * @nameEN Content horizontal padding
     * @desc 控制内容元素水平内间距。
     * @descEN Control the horizontal padding of content element.
     */
    paddingContentHorizontal: number
    /**
     * @nameZH 内容水平内间距（SM）
     * @nameEN Content horizontal padding (SM)
     * @desc 控制内容元素水平内间距，适用于小屏幕设备。
     * @descEN Control the horizontal padding of content element, suitable for small screen devices.
     */
    paddingContentHorizontalSM: number
    /**
     * @nameZH 内容垂直内间距（LG）
     * @nameEN Content vertical padding (LG)
     * @desc 控制内容元素垂直内间距，适用于大屏幕设备。
     * @descEN Control the vertical padding of content element, suitable for large screen devices.
     */
    paddingContentVerticalLG: number
    /**
     * @nameZH 内容垂直内间距
     * @nameEN Content vertical padding
     * @desc 控制内容元素垂直内间距。
     * @descEN Control the vertical padding of content element.
     */
    paddingContentVertical: number
    /**
     * @nameZH 内容垂直内间距（SM）
     * @nameEN Content vertical padding (SM)
     * @desc 控制内容元素垂直内间距，适用于小屏幕设备。
     * @descEN Control the vertical padding of content element, suitable for small screen devices.
     */
    paddingContentVerticalSM: number
    /**
     * @nameZH 外边距 XXS
     * @nameEN Margin XXS
     * @desc 控制元素外边距，最小尺寸。
     * @descEN Control the margin of an element, with the smallest size.
     */
    marginXXS: number
    /**
     * @nameZH 外边距 XS
     * @nameEN Margin XS
     * @desc 控制元素外边距，小尺寸。
     * @descEN Control the margin of an element, with a small size.
     */
    marginXS: number
    /**
     * @nameZH 外边距 SM
     * @nameEN Margin SM
     * @desc 控制元素外边距，中小尺寸。
     * @descEN Control the margin of an element, with a medium-small size.
     */
    marginSM: number
    /**
     * @nameZH 外边距
     * @nameEN Margin
     * @desc 控制元素外边距，中等尺寸。
     * @descEN Control the margin of an element, with a medium size.
     */
    margin: number
    /**
     * @nameZH 外边距 MD
     * @nameEN Margin MD
     * @desc 控制元素外边距，中大尺寸。
     * @descEN Control the margin of an element, with a medium-large size.
     */
    marginMD: number
    /**
     * @nameZH 外边距 LG
     * @nameEN Margin LG
     * @desc 控制元素外边距，大尺寸。
     * @descEN Control the margin of an element, with a large size.
     */
    marginLG: number
    /**
     * @nameZH 外边距 XL
     * @nameEN Margin XL
     * @desc 控制元素外边距，超大尺寸。
     * @descEN Control the margin of an element, with an extra-large size.
     */
    marginXL: number
    /**
     * @nameZH 外边距 XXL
     * @nameEN Margin XXL
     * @desc 控制元素外边距，最大尺寸。
     * @descEN Control the margin of an element, with the largest size.
     */
    marginXXL: number
    /**
     * @nameZH 加载状态透明度
     * @nameEN Loading opacity
     * @desc 控制加载状态的透明度。
     * @descEN Control the opacity of the loading state.
     */
    opacityLoading: number
    /**
     * @nameZH 一级阴影
     * @nameEN Box shadow
     * @desc 控制元素阴影样式。
     * @descEN Control the box shadow style of an element.
     */
    boxShadow: string
    /**
     * @nameZH 二级阴影
     * @nameEN Secondary box shadow
     * @desc 控制元素二级阴影样式。
     * @descEN Control the secondary box shadow style of an element.
     */
    boxShadowSecondary: string
    /**
     * @nameZH 三级阴影
     * @nameEN Tertiary box shadow
     * @desc 控制元素三级盒子阴影样式。
     * @descEN Control the tertiary box shadow style of an element.
     */
    boxShadowTertiary: string
    /**
     * @nameZH 链接文本装饰
     * @nameEN Link text decoration
     * @desc 控制链接文本的装饰样式。
     * @descEN Control the text decoration style of a link.
     */
    linkDecoration: CSSProperties['textDecoration']
    /**
     * @nameZH 链接鼠标悬浮时文本装饰
     * @nameEN Link text decoration on mouse hover
     * @desc 控制链接鼠标悬浮时文本的装饰样式。
     * @descEN Control the text decoration style of a link on mouse hover.
     */
    linkHoverDecoration: CSSProperties['textDecoration']
    /**
     * @nameZH 链接聚焦时文本装饰
     * @nameEN Link text decoration on focus
     * @desc 控制链接聚焦时文本的装饰样式。
     * @descEN Control the text decoration style of a link on focus.
     */
    linkFocusDecoration: CSSProperties['textDecoration']
    /**
     * @nameZH 控制水平内间距
     * @nameEN Control horizontal padding
     * @desc 控制元素水平内间距。
     * @descEN Control the horizontal padding of an element.
     */
    controlPaddingHorizontal: number
    /**
     * @nameZH 控制中小尺寸水平内间距
     * @nameEN Control horizontal padding with a small-medium size
     * @desc 控制元素中小尺寸水平内间距。
     * @descEN Control the horizontal padding of an element with a small-medium size.
     */
    controlPaddingHorizontalSM: number
    /**
     * @nameZH 屏幕宽度（像素） - 超小屏幕
     * @nameEN Screen width (pixels) - Extra small screens
     * @desc 控制超小屏幕的屏幕宽度。
     * @descEN Control the screen width of extra small screens.
     */
    screenXS: number
    /**
     * @nameZH 屏幕宽度（像素） - 超小屏幕最小值
     * @nameEN Screen width (pixels) - Extra small screens minimum value
     * @desc 控制超小屏幕的最小宽度。
     * @descEN Control the minimum width of extra small screens.
     */
    screenXSMin: number
    /**
     * @nameZH 屏幕宽度（像素） - 超小屏幕最大值
     * @nameEN Screen width (pixels) - Extra small screens maximum value
     * @desc 控制超小屏幕的最大宽度。
     * @descEN Control the maximum width of extra small screens.
     */
    screenXSMax: number
    /**
     * @nameZH 屏幕宽度（像素） - 小屏幕
     * @nameEN Screen width (pixels) - Small screens
     * @desc 控制小屏幕的屏幕宽度。
     * @descEN Control the screen width of small screens.
     */
    screenSM: number
    /**
     * @nameZH 屏幕宽度（像素） - 小屏幕最小值
     * @nameEN Screen width (pixels) - Small screens minimum value
     * @desc 控制小屏幕的最小宽度。
     * @descEN Control the minimum width of small screens.
     */
    screenSMMin: number
    /**
     * @nameZH 屏幕宽度（像素） - 小屏幕最大值
     * @nameEN Screen width (pixels) - Small screens maximum value
     * @desc 控制小屏幕的最大宽度。
     * @descEN Control the maximum width of small screens.
     */
    screenSMMax: number
    /**
     * @nameZH 屏幕宽度（像素） - 中等屏幕
     * @nameEN Screen width (pixels) - Medium screens
     * @desc 控制中等屏幕的屏幕宽度。
     * @descEN Control the screen width of medium screens.
     */
    screenMD: number
    /**
     * @nameZH 屏幕宽度（像素） - 中等屏幕最小值
     * @nameEN Screen width (pixels) - Medium screens minimum value
     * @desc 控制中等屏幕的最小宽度。
     * @descEN Control the minimum width of medium screens.
     */
    screenMDMin: number
    /**
     * @nameZH 屏幕宽度（像素） - 中等屏幕最大值
     * @nameEN Screen width (pixels) - Medium screens maximum value
     * @desc 控制中等屏幕的最大宽度。
     * @descEN Control the maximum width of medium screens.
     */
    screenMDMax: number
    /**
     * @nameZH 屏幕宽度（像素） - 大屏幕
     * @nameEN Screen width (pixels) - Large screens
     * @desc 控制大屏幕的屏幕宽度。
     * @descEN Control the screen width of large screens.
     */
    screenLG: number
    /**
     * @nameZH 屏幕宽度（像素） - 大屏幕最小值
     * @nameEN Screen width (pixels) - Large screens minimum value
     * @desc 控制大屏幕的最小宽度。
     * @descEN Control the minimum width of large screens.
     */
    screenLGMin: number
    /**
     * @nameZH 屏幕宽度（像素） - 大屏幕最大值
     * @nameEN Screen width (pixels) - Large screens maximum value
     * @desc 控制大屏幕的最大宽度。
     * @descEN Control the maximum width of large screens.
     */
    screenLGMax: number
    /**
     * @nameZH 屏幕宽度（像素） - 超大屏幕
     * @nameEN Screen width (pixels) - Extra large screens
     * @desc 控制超大屏幕的屏幕宽度。
     * @descEN Control the screen width of extra large screens.
     */
    screenXL: number
    /**
     * @nameZH 屏幕宽度（像素） - 超大屏幕最小值
     * @nameEN Screen width (pixels) - Extra large screens minimum value
     * @desc 控制超大屏幕的最小宽度。
     * @descEN Control the minimum width of extra large screens.
     */
    screenXLMin: number
    /**
     * @nameZH 屏幕宽度（像素） - 超大屏幕最大值
     * @nameEN Screen width (pixels) - Extra large screens maximum value
     * @desc 控制超大屏幕的最大宽度。
     * @descEN Control the maximum width of extra large screens.
     */
    screenXLMax: number
    /**
     * @nameZH 屏幕宽度（像素） - 超超大屏幕
     * @nameEN Screen width (pixels) - Extra extra large screens
     * @desc 控制超超大屏幕的屏幕宽度。
     * @descEN Control the screen width of extra extra large screens.
     */
    screenXXL: number
    /**
     * @nameZH 屏幕宽度（像素） - 超超大屏幕最小值
     * @nameEN Screen width (pixels) - Extra extra large screens minimum value
     * @desc 控制超超大屏幕的最小宽度。
     * @descEN Control the minimum width of extra extra large screens.
     */
    screenXXLMin: number
}

type CSSProperties = CSS.Properties<string | number>

interface MapToken
    extends SeedToken,
        ColorPalettes,
        LegacyColorPalettes,
        ColorMapToken,
        SizeMapToken,
        HeightMapToken,
        StyleMapToken,
        FontMapToken,
        CommonMapToken {}

interface SeedToken extends PresetColorType {
    /**
     * @nameZH 品牌主色
     * @nameEN Brand Color
     * @desc 品牌色是体现产品特性和传播理念最直观的视觉元素之一。在你完成品牌主色的选取之后，我们会自动帮你生成一套完整的色板，并赋予它们有效的设计语义
     * @descEN Brand color is one of the most direct visual elements to reflect the characteristics and communication of the product. After you have selected the brand color, we will automatically generate a complete color palette and assign it effective design semantics.
     */
    colorPrimary: string
    /**
     * @nameZH 成功色
     * @nameEN Success Color
     * @desc 用于表示操作成功的 Token 序列，如 Result、Progress 等组件会使用该组梯度变量。
     * @descEN Used to represent the token sequence of operation success, such as Result, Progress and other components will use these map tokens.
     */
    colorSuccess: string
    /**
     * @nameZH 警戒色
     * @nameEN Warning Color
     * @desc 用于表示操作警告的 Token 序列，如 Notification、 Alert等警告类组件或 Input 输入类等组件会使用该组梯度变量。
     * @descEN Used to represent the warning map token, such as Notification, Alert, etc. Alert or Control component(like Input) will use these map tokens.
     */
    colorWarning: string
    /**
     * @nameZH 错误色
     * @nameEN Error Color
     * @desc 用于表示操作失败的 Token 序列，如失败按钮、错误状态提示（Result）组件等。
     * @descEN Used to represent the visual elements of the operation failure, such as the error Button, error Result component, etc.
     */
    colorError: string
    /**
     * @nameZH 信息色
     * @nameEN Info Color
     * @desc 用于表示操作信息的 Token 序列，如 Alert 、Tag、 Progress 等组件都有用到该组梯度变量。
     * @descEN Used to represent the operation information of the Token sequence, such as Alert, Tag, Progress, and other components use these map tokens.
     */
    colorInfo: string
    /**
     * @nameZH 基础文本色
     * @nameEN Seed Text Color
     * @desc 用于派生文本色梯度的基础变量，v5 中我们添加了一层文本色的派生算法可以产出梯度明确的文本色的梯度变量。但请不要在代码中直接使用该 Seed Token ！
     * @descEN Used to derive the base variable of the text color gradient. In v5, we added a layer of text color derivation algorithm to produce gradient variables of text color gradient. But please do not use this Seed Token directly in the code!
     */
    colorTextBase: string
    /**
     * @nameZH 基础背景色
     * @nameEN Seed Background Color
     * @desc 用于派生背景色梯度的基础变量，v5 中我们添加了一层背景色的派生算法可以产出梯度明确的背景色的梯度变量。但请不要在代码中直接使用该 Seed Token ！
     * @descEN Used to derive the base variable of the background color gradient. In v5, we added a layer of background color derivation algorithm to produce map token of background color. But PLEASE DO NOT USE this Seed Token directly in the code!
     */
    colorBgBase: string
    /**
     * @nameZH 超链接颜色
     * @nameEN Hyperlink color
     * @desc 控制超链接的颜色。
     * @descEN Control the color of hyperlink.
     */
    colorLink: string
    /**
     * @nameZH 字体
     * @nameEN Font family for default text
     * @desc Ant Design 的字体家族中优先使用系统默认的界面字体，同时提供了一套利于屏显的备用字体库，来维护在不同平台以及浏览器的显示下，字体始终保持良好的易读性和可读性，体现了友好、稳定和专业的特性。
     * @descEN The font family of Ant Design prioritizes the default interface font of the system, and provides a set of alternative font libraries that are suitable for screen display to maintain the readability and readability of the font under different platforms and browsers, reflecting the friendly, stable and professional characteristics.
     */
    fontFamily: string
    /**
     * @nameZH 代码字体
     * @nameEN Font family for code text
     * @desc 代码字体，用于 Typography 内的 code、pre 和 kbd 类型的元素
     * @descEN Code font, used for code, pre and kbd elements in Typography
     */
    fontFamilyCode: string
    /**
     * @nameZH 默认字号
     * @nameEN Default Font Size
     * @desc 设计系统中使用最广泛的字体大小，文本梯度也将基于该字号进行派生。
     * @descEN The most widely used font size in the design system, from which the text gradient will be derived.
     * @default 14
     */
    fontSize: number
    /**
     * @nameZH 基础线宽
     * @nameEN Base Line Width
     * @desc 用于控制组件边框、分割线等的宽度
     * @descEN Border width of base components
     */
    lineWidth: number
    /**
     * @nameZH 线条样式
     * @nameEN Line Style
     * @desc 用于控制组件边框、分割线等的样式，默认是实线
     * @descEN Border style of base components
     */
    lineType: string
    /**
     * @nameZH 基础圆角
     * @nameEN Base Border Radius
     * @descEN Border radius of base components
     * @desc 基础组件的圆角大小，例如按钮、输入框、卡片等
     */
    borderRadius: number
    /**
     * @nameZH 尺寸变化单位
     * @nameEN Size Change Unit
     * @desc 用于控制组件尺寸的变化单位，在 Ant Design 中我们的基础单位为 4 ，便于更加细致地控制尺寸梯度
     * @descEN The unit of size change, in Ant Design, our base unit is 4, which is more fine-grained control of the size step
     * @default 4
     */
    sizeUnit: number
    /**
     * @nameZH 尺寸步长
     * @nameEN Size Base Step
     * @desc 用于控制组件尺寸的基础步长，尺寸步长结合尺寸变化单位，就可以派生各种尺寸梯度。通过调整步长即可得到不同的布局模式，例如 V5 紧凑模式下的尺寸步长为 2
     * @descEN The base step of size change, the size step combined with the size change unit, can derive various size steps. By adjusting the step, you can get different layout modes, such as the size step of the compact mode of V5 is 2
     * @default 4
     */
    sizeStep: number
    /**
     * @nameZH 组件箭头尺寸
     * @desc 组件箭头的尺寸
     * @descEN The size of the component arrow
     */
    sizePopupArrow: number
    /**
     * @nameZH 基础高度
     * @nameEN Base Control Height
     * @desc Ant Design 中按钮和输入框等基础控件的高度
     * @descEN The height of the basic controls such as buttons and input boxes in Ant Design
     * @default 32
     */
    controlHeight: number
    /**
     * @nameZH 基础 zIndex
     * @nameEN Base zIndex
     * @desc 所有组件的基础 Z 轴值，用于一些悬浮类的组件的可以基于该值 Z 轴控制层级，例如 BackTop、 Affix 等
     * @descEN The base Z axis value of all components, which can be used to control the level of some floating components based on the Z axis value, such as BackTop, Affix, etc.
     *
     * @default 0
     */
    zIndexBase: number
    /**
     * @nameZH 浮层基础 zIndex
     * @nameEN popup base zIndex
     * @desc 浮层类组件的基础 Z 轴值，用于一些悬浮类的组件的可以基于该值 Z 轴控制层级，例如 FloatButton、 Affix、Modal 等
     * @descEN Base zIndex of component like FloatButton, Affix which can be cover by large popup
     * @default 1000
     */
    zIndexPopupBase: number
    /**
     * @nameZH 图片不透明度
     * @nameEN Define default Image opacity. Useful when in dark-like theme
     * @desc 控制图片不透明度
     * @descEN Control image opacity
     */
    opacityImage: number
    /**
     * @nameZH 动画时长变化单位
     * @nameEN Animation Duration Unit
     * @desc 用于控制动画时长的变化单位
     * @descEN The unit of animation duration change
     * @default 100ms
     */
    motionUnit: number
    /**
     * @nameZH 动画基础时长。
     * @nameEN Animation Base Duration.
     */
    motionBase: number
    /**
     * @desc 预设动效曲率
     * @descEN Preset motion curve.
     */
    motionEaseOutCirc: string
    /**
     * @desc 预设动效曲率
     * @descEN Preset motion curve.
     */
    motionEaseInOutCirc: string
    /**
     * @desc 预设动效曲率
     * @descEN Preset motion curve.
     */
    motionEaseInOut: string
    /**
     * @desc 预设动效曲率
     * @descEN Preset motion curve.
     */
    motionEaseOutBack: string
    /**
     * @desc 预设动效曲率
     * @descEN Preset motion curve.
     */
    motionEaseInBack: string
    /**
     * @desc 预设动效曲率
     * @descEN Preset motion curve.
     */
    motionEaseInQuint: string
    /**
     * @desc 预设动效曲率
     * @descEN Preset motion curve.
     */
    motionEaseOutQuint: string
    /**
     * @desc 预设动效曲率
     * @descEN Preset motion curve.
     */
    motionEaseOut: string
}

declare const PresetColors: readonly [
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
    'lime',
    'gold'
]
type PresetColorKey = (typeof PresetColors)[number]
type PresetColorType = Record<PresetColorKey, string>
type ColorPaletteKeyIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
type ColorPalettes = {
    [key in `${keyof PresetColorType}${ColorPaletteKeyIndex}`]: string
}
type LegacyColorPalettes = {
    [key in `${keyof PresetColorType}-${ColorPaletteKeyIndex}`]: string
}

interface ColorMapToken
    extends ColorNeutralMapToken,
        ColorPrimaryMapToken,
        ColorSuccessMapToken,
        ColorWarningMapToken,
        ColorErrorMapToken,
        ColorInfoMapToken,
        ColorLinkMapToken {
    /**
     * @nameZH 纯白色
     * @desc 不随主题变化的纯白色
     * @descEN Pure white color don't changed by theme
     * @default #FFFFFF
     */
    colorWhite: string
    /**
     * @nameZH 浮层的背景蒙层颜色
     * @nameEN Background color of the mask
     * @desc 浮层的背景蒙层颜色，用于遮罩浮层下面的内容，Modal、Drawer 等组件的蒙层使用的是该 token
     * @descEN The background color of the mask, used to cover the content below the mask, Modal, Drawer and other components use this token
     */
    colorBgMask: string
}

interface ColorNeutralMapToken {
    /**
     * @nameZH 一级文本色
     * @nameEN Text Color
     * @desc 最深的文本色。为了符合W3C标准，默认的文本颜色使用了该色，同时这个颜色也是最深的中性色。
     * @descEN Default text color which comply with W3C standards, and this color is also the darkest neutral color.
     */
    colorText: string
    /**
     * @nameZH 二级文本色
     * @nameEN Secondary Text Color
     * @desc 作为第二梯度的文本色，一般用在不那么需要强化文本颜色的场景，例如 Label 文本、Menu 的文本选中态等场景。
     * @descEN The second level of text color is generally used in scenarios where text color is not emphasized, such as label text, menu text selection state, etc.
     */
    colorTextSecondary: string
    /**
     * @nameZH 三级文本色
     * @desc 第三级文本色一般用于描述性文本，例如表单的中的补充说明文本、列表的描述性文本等场景。
     * @descEN The third level of text color is generally used for descriptive text, such as form supplementary explanation text, list descriptive text, etc.
     */
    colorTextTertiary: string
    /**
     * @nameZH 四级文本色
     * @desc 第四级文本色是最浅的文本色，例如表单的输入提示文本、禁用色文本等。
     * @descEN The fourth level of text color is the lightest text color, such as form input prompt text, disabled color text, etc.
     */
    colorTextQuaternary: string
    /**
     * @nameZH 一级边框色
     * @nameEN Default Border Color
     * @desc 默认使用的边框颜色, 用于分割不同的元素，例如：表单的分割线、卡片的分割线等。
     * @descEN Default border color, used to separate different elements, such as: form separator, card separator, etc.
     */
    colorBorder: string
    /**
     * @nameZH 二级边框色
     * @nameEN Secondary Border Color
     * @desc 比默认使用的边框色要浅一级，此颜色和 colorSplit 的颜色一致。使用的是实色。
     * @descEN Slightly lighter than the default border color, this color is the same as `colorSplit`. Solid color is used.
     */
    colorBorderSecondary: string
    /**
     * @nameZH 一级填充色
     * @desc 最深的填充色，用于拉开与二、三级填充色的区分度，目前只用在 Slider 的 hover 效果。
     * @descEN The darkest fill color is used to distinguish between the second and third level of fill color, and is currently only used in the hover effect of Slider.
     */
    colorFill: string
    /**
     * @nameZH 二级填充色
     * @desc 二级填充色可以较为明显地勾勒出元素形体，如 Rate、Skeleton 等。也可以作为三级填充色的 Hover 状态，如 Table 等。
     * @descEN The second level of fill color can outline the shape of the element more clearly, such as Rate, Skeleton, etc. It can also be used as the Hover state of the third level of fill color, such as Table, etc.
     */
    colorFillSecondary: string
    /**
     * @nameZH 三级填充色
     * @desc 三级填充色用于勾勒出元素形体的场景，如 Slider、Segmented 等。如无强调需求的情况下，建议使用三级填色作为默认填色。
     * @descEN The third level of fill color is used to outline the shape of the element, such as Slider, Segmented, etc. If there is no emphasis requirement, it is recommended to use the third level of fill color as the default fill color.
     */
    colorFillTertiary: string
    /**
     * @nameZH 四级填充色
     * @desc 最弱一级的填充色，适用于不易引起注意的色块，例如斑马纹、区分边界的色块等。
     * @descEN The weakest level of fill color is suitable for color blocks that are not easy to attract attention, such as zebra stripes, color blocks that distinguish boundaries, etc.
     */
    colorFillQuaternary: string
    /**
     * @nameZH 布局背景色
     * @nameEN Layout Background Color
     * @desc 该色用于页面整体布局的背景色，只有需要在页面中处于 B1 的视觉层级时才会使用该 token，其他用法都是错误的
     * @descEN This color is used for the background color of the overall layout of the page. This token will only be used when it is necessary to be at the B1 visual level in the page. Other usages are wrong.
     */
    colorBgLayout: string
    /**
     * @nameZH 组件容器背景色
     * @desc 组件的容器背景色，例如：默认按钮、输入框等。务必不要将其与 `colorBgElevated` 混淆。
     * @descEN Container background color, e.g: default button, input box, etc. Be sure not to confuse this with `colorBgElevated`.
     */
    colorBgContainer: string
    /**
     * @nameZH 浮层容器背景色
     * @desc 浮层容器背景色，在暗色模式下该 token 的色值会比 `colorBgContainer` 要亮一些。例如：模态框、弹出框、菜单等。
     * @descEN Container background color of the popup layer, in dark mode the color value of this token will be a little brighter than `colorBgContainer`. E.g: modal, pop-up, menu, etc.
     */
    colorBgElevated: string
    /**
     * @nameZH 引起注意的背景色
     * @desc 该色用于引起用户强烈关注注意的背景色，目前只用在 Tooltip 的背景色上。
     * @descEN This color is used to draw the user's strong attention to the background color, and is currently only used in the background color of Tooltip.
     */
    colorBgSpotlight: string
    /**
     * @nameZH 毛玻璃容器背景色
     * @nameEN Frosted glass container background color
     * @desc 控制毛玻璃容器的背景色，通常为透明色。
     * @descEN Control the background color of frosted glass container, usually transparent.
     */
    colorBgBlur: string
    /**
     * @desc 实心的背景颜色，目前只用在默认实心按钮背景色上。
     * @descEN Solid background color, currently only used for the default solid button background color.
     */
    colorBgSolid: string
    /**
     * @desc 实心的背景颜色激活态，目前只用在默认实心按钮的 active 效果。
     * @descEN Solid background color active state, currently only used in the active effect of the default solid button.
     */
    colorBgSolidActive: string
    /**
     * @desc 实心的背景颜色悬浮态，目前只用在默认实心按钮的 hover 效果。
     * @descEN Solid background color hover state, currently only used in the hover effect of the default solid button.
     */
    colorBgSolidHover: string
}
/**
 * 品牌色梯度变量
 */
interface ColorPrimaryMapToken {
    /**
     * @nameZH 品牌主色
     * @nameEN Primary color of the brand
     * @desc 品牌色是体现产品特性和传播理念最直观的视觉元素之一，用于产品的主色调、主按钮、主图标、主文本等
     * @descEN The brand color is one of the most intuitive visual elements that reflects product characteristics and communication concepts, and is used for the main color tone, main buttons, main icons, main text, etc. of the product.
     */
    colorPrimary: string
    /**
     * @nameZH 主色浅色背景色
     * @nameEN Light background color of primary color
     * @desc 主色浅色背景颜色，一般用于视觉层级较弱的选中状态。
     * @descEN Light background color of primary color, usually used for weak visual level selection state.
     */
    colorPrimaryBg: string
    /**
     * @nameZH 主色浅色背景悬浮态
     * @nameEN Hover state of light background color of primary color
     * @desc 与主色浅色背景颜色相对应的悬浮态颜色。
     * @descEN The hover state color corresponding to the light background color of the primary color.
     */
    colorPrimaryBgHover: string
    /**
     * @nameZH 主色描边色
     * @nameEN Border color of primary color
     * @desc 主色梯度下的描边用色，用在 Slider 等组件的描边上。
     * @descEN The stroke color under the main color gradient, used on the stroke of components such as Slider.
     */
    colorPrimaryBorder: string
    /**
     * @nameZH 主色描边色悬浮态
     * @nameEN Hover state of border color of primary color
     * @desc 主色梯度下的描边用色的悬浮态，Slider 、Button 等组件的描边 Hover 时会使用。
     * @descEN The hover state of the stroke color under the main color gradient, which will be used when the stroke Hover of components such as Slider and Button.
     */
    colorPrimaryBorderHover: string
    /**
     * @nameZH 主色悬浮态
     * @nameEN Hover state of primary color
     * @desc 主色梯度下的悬浮态。
     * @descEN Hover state under the main color gradient.
     */
    colorPrimaryHover: string
    /**
     * @nameZH 主色激活态
     * @nameEN Active state of primary color
     * @desc 主色梯度下的深色激活态。
     * @descEN Dark active state under the main color gradient.
     */
    colorPrimaryActive: string
    /**
     * @nameZH 主色文本悬浮态
     * @nameEN Hover state of text color of primary color
     * @desc 主色梯度下的文本悬浮态。
     * @descEN Hover state of text color under the main color gradient.
     */
    colorPrimaryTextHover: string
    /**
     * @nameZH 主色文本
     * @nameEN Text color of primary color
     * @desc 主色梯度下的文本颜色。
     * @descEN Text color under the main color gradient.
     */
    colorPrimaryText: string
    /**
     * @nameZH 主色文本激活态
     * @nameEN Active state of text color of primary color
     * @desc 主色梯度下的文本激活态。
     * @descEN Active state of text color under the main color gradient.
     */
    colorPrimaryTextActive: string
}
interface ColorSuccessMapToken {
    /**
     * @nameZH 成功色的浅色背景颜色
     * @nameEN Light Background Color of Success Color
     * @desc 成功色的浅色背景颜色，用于 Tag 和 Alert 的成功态背景色
     * @descEN Light background color of success color, used for Tag and Alert success state background color
     */
    colorSuccessBg: string
    /**
     * @nameZH 成功色的浅色背景色悬浮态
     * @nameEN Hover State Color of Light Success Background
     * @desc 成功色浅色背景颜色，一般用于视觉层级较弱的选中状态，不过 antd 目前没有使用到该 token
     * @descEN Light background color of success color, but antd does not use this token currently
     */
    colorSuccessBgHover: string
    /**
     * @nameZH 成功色的描边色
     * @nameEN Border Color of Success Color
     * @desc 成功色的描边色，用于 Tag 和 Alert 的成功态描边色
     * @descEN Border color of success color, used for Tag and Alert success state border color
     */
    colorSuccessBorder: string
    /**
     * @nameZH 成功色的描边色悬浮态
     * @nameEN Hover State Color of Success Border
     * @desc 成功色的描边色悬浮态
     * @descEN Hover state color of success color border
     */
    colorSuccessBorderHover: string
    /**
     * @nameZH 成功色的深色悬浮态
     * @nameEN Hover State Color of Dark Success
     * @desc 成功色的深色悬浮态
     * @descEN Hover state color of dark success color
     */
    colorSuccessHover: string
    /**
     * @nameZH 成功色
     * @nameEN Success Color
     * @desc 默认的成功色，如 Result、Progress 等组件中都有使用该颜色
     * @descEN Default success color, used in components such as Result and Progress
     */
    colorSuccess: string
    /**
     * @nameZH 成功色的深色激活态
     * @nameEN Active State Color of Dark Success
     * @desc 成功色的深色激活态
     * @descEN Active state color of dark success color
     */
    colorSuccessActive: string
    /**
     * @nameZH 成功色的文本悬浮态
     * @nameEN Hover State Color of Success Text
     * @desc 成功色的文本悬浮态
     * @descEN Hover state color of success color text
     */
    colorSuccessTextHover: string
    /**
     * @nameZH 成功色的文本默认态
     * @nameEN Default State Color of Success Text
     * @desc 成功色的文本默认态
     * @descEN Default state color of success color text
     */
    colorSuccessText: string
    /**
     * @nameZH 成功色的文本激活态
     * @nameEN Active State Color of Success Text
     * @desc 成功色的文本激活态
     * @descEN Active state color of success color text
     */
    colorSuccessTextActive: string
}
interface ColorWarningMapToken {
    /**
     * @nameZH 警戒色的浅色背景颜色
     * @nameEN Warning background color
     * @desc 警戒色的浅色背景颜色
     * @descEN The background color of the warning state.
     */
    colorWarningBg: string
    /**
     * @nameZH 警戒色的浅色背景色悬浮态
     * @nameEN Warning background color hover state
     * @desc 警戒色的浅色背景色悬浮态
     * @descEN The hover state background color of the warning state.
     */
    colorWarningBgHover: string
    /**
     * @nameZH 警戒色的描边色
     * @nameEN Warning border color
     * @desc 警戒色的描边色
     * @descEN The border color of the warning state.
     */
    colorWarningBorder: string
    /**
     * @nameZH 警戒色的描边色悬浮态
     * @nameEN Warning border color hover state
     * @desc 警戒色的描边色悬浮态
     * @descEN The hover state border color of the warning state.
     */
    colorWarningBorderHover: string
    /**
     * @nameZH 警戒色的深色悬浮态
     * @nameEN Warning hover color
     * @desc 警戒色的深色悬浮态
     * @descEN The hover state of the warning color.
     */
    colorWarningHover: string
    /**
     * @nameZH 警戒色
     * @nameEN Warning color
     * @desc 最常用的警戒色，例如 Notification、 Alert等警告类组件或 Input 输入类等组件会使用该颜色
     * @descEN The most commonly used warning color, used for warning components such as Notification, Alert, or input components.
     */
    colorWarning: string
    /**
     * @nameZH 警戒色的深色激活态
     * @nameEN Warning active color
     * @desc 警戒色的深色激活态
     * @descEN The active state of the warning color.
     */
    colorWarningActive: string
    /**
     * @nameZH 警戒色的文本悬浮态
     * @nameEN Warning text hover state
     * @desc 警戒色的文本悬浮态
     * @descEN The hover state of the text in the warning color.
     */
    colorWarningTextHover: string
    /**
     * @nameZH 警戒色的文本默认态
     * @nameEN Warning text default state
     * @desc 警戒色的文本默认态
     * @descEN The default state of the text in the warning color.
     */
    colorWarningText: string
    /**
     * @nameZH 警戒色的文本激活态
     * @nameEN Warning text active state
     * @desc 警戒色的文本激活态
     * @descEN The active state of the text in the warning color.
     */
    colorWarningTextActive: string
}
interface ColorInfoMapToken {
    /**
     * @nameZH 信息色的浅色背景颜色
     * @nameEN Light background color of information color
     * @desc 信息色的浅色背景颜色。
     * @descEN Light background color of information color.
     */
    colorInfoBg: string
    /**
     * @nameZH 信息色的浅色背景色悬浮态
     * @nameEN Hover state of light background color of information color
     * @desc 信息色的浅色背景色悬浮态。
     * @descEN Hover state of light background color of information color.
     */
    colorInfoBgHover: string
    /**
     * @nameZH 信息色的描边色
     * @nameEN Border color of information color
     * @desc 信息色的描边色。
     * @descEN Border color of information color.
     */
    colorInfoBorder: string
    /**
     * @nameZH 信息色的描边色悬浮态
     * @nameEN Hover state of border color of information color
     * @desc 信息色的描边色悬浮态。
     * @descEN Hover state of border color of information color.
     */
    colorInfoBorderHover: string
    /**
     * @nameZH 信息色的深色悬浮态
     * @nameEN Hover state of dark color of information color
     * @desc 信息色的深色悬浮态。
     * @descEN Hover state of dark color of information color.
     */
    colorInfoHover: string
    /**
     * @nameZH 信息色
     * @nameEN Information color
     * @desc 信息色。
     * @descEN Information color.
     */
    colorInfo: string
    /**
     * @nameZH 信息色的深色激活态
     * @nameEN Active state of dark color of information color
     * @desc 信息色的深色激活态。
     * @descEN Active state of dark color of information color.
     */
    colorInfoActive: string
    /**
     * @nameZH 信息色的文本悬浮态
     * @nameEN Hover state of text color of information color
     * @desc 信息色的文本悬浮态。
     * @descEN Hover state of text color of information color.
     */
    colorInfoTextHover: string
    /**
     * @nameZH 信息色的文本默认态
     * @nameEN Default state of text color of information color
     * @desc 信息色的文本默认态。
     * @descEN Default state of text color of information color.
     */
    colorInfoText: string
    /**
     * @nameZH 信息色的文本激活态
     * @nameEN Active state of text color of information color
     * @desc 信息色的文本激活态。
     * @descEN Active state of text color of information color.
     */
    colorInfoTextActive: string
}
interface ColorErrorMapToken {
    /**
     * @nameZH 错误色的浅色背景颜色
     * @nameEN Error background color
     * @desc 错误色的浅色背景颜色
     * @descEN The background color of the error state.
     */
    colorErrorBg: string
    /**
     * @nameZH 错误色的浅色背景色悬浮态
     * @nameEN Error background color hover state
     * @desc 错误色的浅色背景色悬浮态
     * @descEN The hover state background color of the error state.
     */
    colorErrorBgHover: string
    /**
     * @nameZH 错误色的浅色填充背景色悬浮态
     * @nameEN Wrong color fill background color suspension state
     * @desc 错误色的浅色填充背景色悬浮态，目前只用在危险填充按钮的 hover 效果。
     * @descEN The wrong color fills the background color of the suspension state, which is currently only used in the hover effect of the dangerous filled button.
     */
    colorErrorBgFilledHover: string
    /**
     * @nameZH 错误色的浅色背景色激活态
     * @nameEN Error background color active state
     * @desc 错误色的浅色背景色激活态
     * @descEN The active state background color of the error state.
     */
    colorErrorBgActive: string
    /**
     * @nameZH 错误色的描边色
     * @nameEN Error border color
     * @desc 错误色的描边色
     * @descEN The border color of the error state.
     */
    colorErrorBorder: string
    /**
     * @nameZH 错误色的描边色悬浮态
     * @nameEN Error border color hover state
     * @desc 错误色的描边色悬浮态
     * @descEN The hover state border color of the error state.
     */
    colorErrorBorderHover: string
    /**
     * @nameZH 错误色的深色悬浮态
     * @nameEN Error hover color
     * @desc 错误色的深色悬浮态
     * @descEN The hover state of the error color.
     */
    colorErrorHover: string
    /**
     * @nameZH 错误色
     * @nameEN Error color
     * @desc 错误色
     * @descEN The color of the error state.
     */
    colorError: string
    /**
     * @nameZH 错误色的深色激活态
     * @nameEN Error active color
     * @desc 错误色的深色激活态
     * @descEN The active state of the error color.
     */
    colorErrorActive: string
    /**
     * @nameZH 错误色的文本悬浮态
     * @nameEN Error text hover state
     * @desc 错误色的文本悬浮态
     * @descEN The hover state of the text in the error color.
     */
    colorErrorTextHover: string
    /**
     * @nameZH 错误色的文本默认态
     * @nameEN Error text default state
     * @desc 错误色的文本默认态
     * @descEN The default state of the text in the error color.
     */
    colorErrorText: string
    /**
     * @nameZH 错误色的文本激活态
     * @nameEN Error text active state
     * @desc 错误色的文本激活态
     * @descEN The active state of the text in the error color.
     */
    colorErrorTextActive: string
}
interface ColorLinkMapToken {
    /**
     * @nameZH 超链接颜色
     * @nameEN Hyperlink color
     * @desc 控制超链接的颜色。
     * @descEN Control the color of hyperlink.
     */
    colorLink: string
    /**
     * @nameZH 超链接悬浮颜色
     * @nameEN Hyperlink hover color
     * @desc 控制超链接悬浮时的颜色。
     * @descEN Control the color of hyperlink when hovering.
     */
    colorLinkHover: string
    /**
     * @nameZH 超链接激活颜色
     * @nameEN Hyperlink active color
     * @desc 控制超链接被点击时的颜色。
     * @descEN Control the color of hyperlink when clicked.
     */
    colorLinkActive: string
}

interface SizeMapToken {
    /**
     * @nameZH XXL
     * @default 48
     */
    sizeXXL: number
    /**
     * @nameZH XL
     * @default 32
     */
    sizeXL: number
    /**
     * @nameZH LG
     * @default 24
     */
    sizeLG: number
    /**
     * @nameZH MD
     * @default 20
     */
    sizeMD: number
    /** Same as size by default, but could be larger in compact mode */
    sizeMS: number
    /**
     * @nameZH 默认
     * @desc 默认尺寸
     * @default 16
     */
    size: number
    /**
     * @nameZH SM
     * @default 12
     */
    sizeSM: number
    /**
     * @nameZH XS
     * @default 8
     */
    sizeXS: number
    /**
     * @nameZH XXS
     * @default 4
     */
    sizeXXS: number
}

interface HeightMapToken {
    /** Only Used for control inside component like Multiple Select inner selection item */
    /**
     * @nameZH 更小的组件高度
     * @nameEN XS component height
     * @desc 更小的组件高度
     * @descEN XS component height
     */
    controlHeightXS: number
    /**
     * @nameZH 较小的组件高度
     * @nameEN SM component height
     * @desc 较小的组件高度
     * @descEN SM component height
     */
    controlHeightSM: number
    /**
     * @nameZH 较高的组件高度
     * @nameEN LG component height
     * @desc 较高的组件高度
     * @descEN LG component height
     */
    controlHeightLG: number
}

interface StyleMapToken {
    /**
     * @nameZH 线宽
     * @nameEN Line Width
     * @desc 描边类组件的默认线宽，如 Button、Input、Select 等输入类控件。
     * @descEN The default line width of the outline class components, such as Button, Input, Select, etc.
     * @default 1
     */
    lineWidthBold: number
    /**
     * @nameZH XS号圆角
     * @nameEN XS Border Radius
     * @desc XS号圆角，用于组件中的一些小圆角，如 Segmented 、Arrow 等一些内部圆角的组件样式中。
     * @descEN XS size border radius, used in some small border radius components, such as Segmented, Arrow and other components with small border radius.
     * @default 2
     */
    borderRadiusXS: number
    /**
     * @nameZH SM号圆角
     * @nameEN SM Border Radius
     * @desc SM号圆角，用于组件小尺寸下的圆角，如 Button、Input、Select 等输入类控件在 small size 下的圆角
     * @descEN SM size border radius, used in small size components, such as Button, Input, Select and other input components in small size
     * @default 4
     */
    borderRadiusSM: number
    /**
     * @nameZH LG号圆角
     * @nameEN LG Border Radius
     * @desc LG号圆角，用于组件中的一些大圆角，如 Card、Modal 等一些组件样式。
     * @descEN LG size border radius, used in some large border radius components, such as Card, Modal and other components.
     * @default 8
     */
    borderRadiusLG: number
    /**
     * @nameZH 外部圆角
     * @nameEN Outer Border Radius
     * @default 4
     * @desc 外部圆角
     * @descEN Outer border radius
     */
    borderRadiusOuter: number
}

interface FontMapToken {
    /**
     * @desc 小号字体大小
     * @descEN Small font size
     */
    fontSizeSM: number
    /**
     * @desc 标准字体大小
     * @descEN Standard font size
     */
    fontSize: number
    /**
     * @desc 大号字体大小
     * @descEN Large font size
     */
    fontSizeLG: number
    /**
     * @desc 超大号字体大小
     * @descEN Super large font size
     */
    fontSizeXL: number
    /**
     * @nameZH 一级标题字号
     * @nameEN Font size of heading level 1
     * @desc H1 标签所使用的字号
     * @descEN Font size of h1 tag.
     * @default 38
     */
    fontSizeHeading1: number
    /**
     * @nameZH 二级标题字号
     * @nameEN Font size of heading level 2
     * @desc h2 标签所使用的字号
     * @descEN Font size of h2 tag.
     * @default 30
     */
    fontSizeHeading2: number
    /**
     * @nameZH 三级标题字号
     * @nameEN Font size of heading level 3
     * @desc h3 标签使用的字号
     * @descEN Font size of h3 tag.
     * @default 24
     */
    fontSizeHeading3: number
    /**
     * @nameZH 四级标题字号
     * @nameEN Font size of heading level 4
     * @desc h4 标签使用的字号
     * @descEN Font size of h4 tag.
     * @default 20
     */
    fontSizeHeading4: number
    /**
     * @nameZH 五级标题字号
     * @nameEN Font size of heading level 5
     * @desc h5 标签使用的字号
     * @descEN Font size of h5 tag.
     * @default 16
     */
    fontSizeHeading5: number
    /**
     * @desc 文本行高
     * @descEN Line height of text.
     */
    lineHeight: number
    /**
     * @desc 大型文本行高
     * @descEN Line height of large text.
     */
    lineHeightLG: number
    /**
     * @desc 小型文本行高
     * @descEN Line height of small text.
     */
    lineHeightSM: number
    /**
     * @nameZH 一级标题行高
     * @nameEN Line height of heading level 1
     * @desc H1 标签所使用的行高
     * @descEN Line height of h1 tag.
     * @default 1.4
     */
    lineHeightHeading1: number
    /**
     * @nameZH 二级标题行高
     * @nameEN Line height of heading level 2
     * @desc h2 标签所使用的行高
     * @descEN Line height of h2 tag.
     * @default 1.35
     */
    lineHeightHeading2: number
    /**
     * @nameZH 三级标题行高
     * @nameEN Line height of heading level 3
     * @desc h3 标签所使用的行高
     * @descEN Line height of h3 tag.
     * @default 1.3
     */
    lineHeightHeading3: number
    /**
     * @nameZH 四级标题行高
     * @nameEN Line height of heading level 4
     * @desc h4 标签所使用的行高
     * @descEN Line height of h4 tag.
     * @default 1.25
     */
    lineHeightHeading4: number
    /**
     * @nameZH 五级标题行高
     * @nameEN Line height of heading level 5
     * @desc h5 标签所使用的行高
     * @descEN Line height of h5 tag.
     * @default 1.2
     */
    lineHeightHeading5: number
}

interface CommonMapToken extends StyleMapToken {
    /**
     * @desc 动效播放速度，快速。用于小型元素动画交互
     * @descEN Motion speed, fast speed. Used for small element animation interaction.
     */
    motionDurationFast: string
    /**
     * @desc 动效播放速度，中速。用于中型元素动画交互
     * @descEN Motion speed, medium speed. Used for medium element animation interaction.
     */
    motionDurationMid: string
    /**
     * @desc 动效播放速度，慢速。用于大型元素如面板动画交互
     * @descEN Motion speed, slow speed. Used for large element animation interaction.
     */
    motionDurationSlow: string
}
