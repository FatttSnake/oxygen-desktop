import { createStyles } from 'antd-style'

export default createStyles(({ cx, css, token }) => {
    const menuBt = cx(css`
        border-radius: ${token.borderRadiusLG}px;
        overflow: hidden;
        height: 40px;

        a {
            display: flex;
            align-items: center;
            height: 100%;
            width: 100%;
            transition: all 0.2s;
            background-color: ${token.colorBgContainer};
        }
    `)

    const active = cx(css`
        color: ${token.colorTextLightSolid};
        background-color: ${token.colorPrimary} !important;
    `)

    return {
        item: css`
            position: relative;
            font-size: ${token.fontSizeHeading5}px;

            &:hover > div > a:not(.${active}),
            &:hover > a:not(.${active}) {
                background-color: ${token.colorBgLayout};
            }
        `,

        submenuItem: css`
            border-radius: ${token.borderRadiusLG}px;
            white-space: nowrap;
            overflow: hidden;
            padding: 0 !important;

            a {
                display: block;
                padding: ${token.paddingXS}px ${token.paddingMD}px;
                transition: all 0.2s;
            }
        `,

        menuBt,

        active,

        icon: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: `0 ${token.paddingXS}px`,
            width: 40,
            height: 40,
            flex: '0 0 auto',
            fontSize: token.sizeMD,
            cursor: 'pointer',

            img: {
                width: '100%'
            }
        },

        text: {
            flex: 1,
            paddingLeft: token.paddingXS,
            width: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },

        collapsedText: {
            display: 'none'
        },

        collapsedExtend: {
            display: 'none'
        }
    }
})
