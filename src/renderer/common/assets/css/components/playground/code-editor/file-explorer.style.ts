import { createStyles } from 'antd-style'

export default createStyles(() => ({
    dirTree: {
        width: 'fit-content',
        minWidth: '100%',
        whiteSpace: 'nowrap',

        '.ant-tree-treenode-draggable': {
            cursor: 'pointer'
        },

        '.ant-tree-switcher': {
            width: 0,
            height: 0,
            pointerEvents: 'none'
        },

        '.ant-tree-switcher::before': {
            width: 0,
            height: 0
        },

        '.ant-tree-treenode': {
            marginBottom: 0
        },

        '.ant-tree-treenode:before': {
            height: 0
        }
    }
}))
