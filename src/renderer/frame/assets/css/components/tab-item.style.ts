import { createStyles } from 'antd-style'

export default createStyles(({ cx, css, token }) => {
    const close = cx(css`
        display: flex;
        justify-content: center;
        align-items: center;
        width: ${token.sizeMS}px;
        height: ${token.sizeMS}px;
        font-size: ${token.fontSizeIcon / 2}px;
        color: ${token.colorTextSecondary};
        border-radius: 3px;
        opacity: 0;
        transition: 0.2s;
        cursor: pointer;

        :hover {
            background-color: ${token.colorBgTextHover};
        }
    `)

    return {
        root: {
            display: 'flex',
            position: 'relative',
            height: `calc(100% - ${token.marginXS}px)`,
            alignItems: 'center',
            marginTop: token.marginXS,
            marginLeft: -1,
            padding: `0 ${token.paddingSM}px`,
            gap: token.sizeXS,
            borderRadius: `${token.borderRadius}px ${token.borderRadius}px 0 0`,
            backgroundColor: 'transparent',
            transition: '0.2s',
            '-webkit-app-region': 'no-drag',

            '::before, ::after': {
                position: 'absolute',
                content: '""',
                bottom: 0,
                width: 16,
                height: 16,
                borderRadius: '100%',
                boxShadow: '0 0 0 3px transparent',
                transition: '0.2s'
            },

            '::before': {
                left: -16,
                clipPath: 'inset(50% -10px 0 50%)'
            },

            '::after': {
                right: -16,
                clipPath: 'inset(50% 50% 0 -10px)'
            },

            ':hover': css`
                background-color: #2c2c2c;

                ::before,
                ::after {
                    box-shadow: 0 0 0 3px #2c2c2c;
                }

                + div {
                    opacity: 0;
                }

                .${close} {
                    opacity: 1;
                }
            `
        },

        active: {
            backgroundColor: '#3b3b3b !important',
            zIndex: token.zIndexPopupBase,

            '::before, ::after': {
                boxShadow: '0 0 0 3px #3b3b3b !important'
            },

            '+ div': {
                opacity: 0
            },

            [`.${close}`]: {
                opacity: 1
            }
        },

        icon: {
            fontSize: token.fontSizeIcon
        },

        title: {},

        close
    }
})
