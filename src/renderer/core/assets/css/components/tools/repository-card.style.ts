import { createStyles } from 'antd-style'

export default createStyles(({ cx, css, token }) => {
    const info = cx(css`
        padding: 0 ${token.paddingSM}px;
        transform: translateY(${token.sizeXL}px);
        transition: all 0.1s ease;
    `)

    const buttonGroup = cx(css`
        > * {
            > :first-child {
                flex: 1;
            }
        }
    `)

    const toolDesc = cx(css`
        position: relative;
        margin-top: ${token.marginXS}px;
        color: ${token.colorTextDescription};
        transition: all 0.1s ease;
    `)

    const operation = cx(css`
        display: flex;
        position: absolute;
        flex: 1;
        gap: ${token.sizeXXS}px;
        bottom: ${token.sizeLG}px;
        padding: 0 ${token.paddingLG}px;
        width: 100%;
        flex-direction: column;
        opacity: 0;

        > *,
        .${buttonGroup} > * {
            width: 100%;
        }
    `)

    return {
        root: css`
            width: 180px;
            height: 290px;
            text-align: center;
            gap: ${token.sizeSM}px;

            > * {
                flex: 0 0 auto;
            }

            &:hover {
                .${info} {
                    transform: translateY(-${token.sizeXXS}px);
                    transition: all 0.2s ease;
                }

                .${toolDesc} {
                    opacity: 0;
                }

                .${operation} {
                    opacity: 1;
                    transition: all 0.4s ease;
                }
            }
        `,

        header: {
            display: 'flex',
            width: '100%',
            padding: token.paddingSM,
            gap: token.paddingXS,

            '> :first-child': {
                width: 0,
                flex: 1
            },

            '> :not(:first-child)': {
                fontSize: token.size
            }
        },

        icon: {
            img: {
                width: token.sizeXL * 2,
                height: token.sizeXL * 2
            }
        },

        info,

        toolName: {
            fontSize: token.fontSizeXL,
            fontWeight: 'bolder',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
        },

        toolDesc,

        operation,

        buttonGroup
    }
})
