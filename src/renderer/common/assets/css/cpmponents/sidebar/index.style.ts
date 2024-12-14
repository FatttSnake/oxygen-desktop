import { createStyles } from 'antd-style'

export default createStyles(({ cx, css, token }) => {
    const title = cx(css`
        display: flex;
        align-items: center;
        font-weight: bold;
        padding: ${token.paddingXS}px ${token.paddingSM}px;
        color: ${token.colorPrimary};
        overflow: hidden;
    `)

    const titleIcon = cx(css`
        display: flex;
        justify-content: center;
        align-items: center;
        padding: ${token.paddingXS}px;
        width: 40px;
        height: 40px;
        font-size: ${token.sizeMD}px;
        border-radius: ${token.borderRadiusLG}px;
        cursor: pointer;

        span {
            transform: rotateZ(180deg);
            transition: all 0.3s;
        }

        &:hover {
            background-color: ${token.colorBgLayout};
        }
    `)

    const titleText = cx(css`
        flex: 1;
        font-size: ${token.fontSizeHeading3}px;
        text-align: center;
        letter-spacing: ${token.sizeXS}px;
    `)

    return {
        sidebar: {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            userSelect: 'none',
            transition: 'all .3s',
            whiteSpace: 'nowrap',
            borderRight: `1px solid ${token.colorBorder}`
        },

        title,

        titleIcon,

        titleText,

        content: {
            display: 'flex',
            minHeight: 0,
            flexDirection: 'column',
            flex: 1,

            'ul > li, ul > div > li': {
                padding: `${token.paddingXXS}px ${token.paddingSM}px`
            }
        },

        collapse: cx(css`
            width: ${token.sizeXL * 2 + 1}px !important;

            .${title} {
                .${titleIcon} {
                    span {
                        transform: rotateZ(360deg);
                        transition: all 0.3s;
                    }
                }

                .${titleText} {
                    display: none;
                }
            }
        `)
    }
})
