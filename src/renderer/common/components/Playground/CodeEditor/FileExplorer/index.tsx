import Icon from '@ant-design/icons'
import useStyles from '$/assets/css/components/playground/code-editor/file-explorer.style'
import { modal } from '$/util/common'
import HideScrollbar, { HideScrollbarElement } from '$/components/HideScrollbar'
import { IFileTree } from '$/components/Playground/shared'
import { findNodeByKey } from '$/components/Playground/files'

const fileTreeToTreeData = (fileTree: IFileTree): _TreeDataNode => ({
    key: fileTree.key,
    title: fileTree.fileName ? fileTree.fileName : '/',
    children: fileTree.children?.map(fileTreeToTreeData),
    isLeaf: fileTree.children === undefined,
    selectable: fileTree.children === undefined
})

interface FileExplorerProps {
    fileTree: IFileTree
    selectedKey: string
    onSelect?: (fileKey: string) => void
    onAdd?: (fileName: string, isDir: boolean, parentKey: string) => void
    onRename?: (fileKey: string, newFileName: string) => void
    onMove?: (fileKey: string, newParentKey: string) => void
    onRemove?: (fileKey: string) => void
}

const FileExplorer = ({
    fileTree,
    selectedKey,
    onSelect,
    onAdd,
    onRename,
    onMove,
    onRemove
}: FileExplorerProps) => {
    const { styles, theme } = useStyles()
    const rootRef = useRef<HideScrollbarElement>(null)
    const [fileNameForm] = AntdForm.useForm<{ fileName: string }>()
    const [expandedKeys, setExpandedKeys] = useState<(string | number | bigint)[]>([selectedKey])
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [rightClickNode, setRightClickNode] = useState<{ node: IFileTree; parent?: IFileTree }>()
    const [isAbleToNewFile, setIsAbleToNewFile] = useState(false)
    const [isAbleToRename, setIsAbleToRename] = useState(false)
    const [isAbleToDelete, setIsAbleToDelete] = useState(false)
    const treeData: _TreeDataNode[] = [fileTreeToTreeData(fileTree)]

    const menuItems = [
        {
            key: 'new_file',
            label: 'New File',
            title: 'New File'
        },
        {
            key: 'new_dir',
            label: 'New Directory',
            title: 'New Directory'
        },
        {
            key: 'rename',
            label: 'Rename',
            title: 'Rename'
        },
        {
            key: 'delete',
            label: 'Delete',
            title: 'Delete'
        }
    ].filter(({ key }) => {
        if ((key === 'new_file' || key === 'new_dir') && isAbleToNewFile) {
            return true
        }
        if (key === 'rename' && isAbleToRename) {
            return true
        }
        return key === 'delete' && isAbleToDelete
    })

    const handleOnSelect = (keys: (string | number | bigint)[]) => {
        onSelect?.(keys[0] as string)
    }

    const handleOnRightClick = (key: string) => {
        const node = findNodeByKey(fileTree, key)
        setRightClickNode(node)

        if (!node) {
            setIsAbleToNewFile(false)
            setIsAbleToRename(false)
            setIsAbleToDelete(false)

            return
        }

        if (key === fileTree.key) {
            setIsAbleToNewFile(true)
            setIsAbleToRename(false)
            setIsAbleToDelete(false)

            return
        }

        setIsAbleToNewFile(true)
        setIsAbleToRename(true)
        setIsAbleToDelete(true)
    }

    const handleOnDrop = (key: string, target: string) => {
        onMove?.(key, target)
    }

    useEffect(() => {
        let keys: string[] = []
        let parent = findNodeByKey(fileTree, selectedKey)?.parent
        while (parent) {
            keys = [...keys, parent.key]
            parent = findNodeByKey(fileTree, parent.key)?.parent
        }
        setExpandedKeys([...new Set([...expandedKeys, ...keys])])
    }, [selectedKey])

    useEffect(() => {
        const contextMenuListener = (e: Event) => {
            if (e.target instanceof HTMLElement && e.target.tagName === 'DIV') {
                e.preventDefault()
            }
        }
        rootRef.current?.addEventListener('contextmenu', contextMenuListener)

        return () => {
            rootRef.current?.removeEventListener('contextmenu', contextMenuListener)
        }
    }, [])

    return (
        <HideScrollbar ref={rootRef} isShowVerticalScrollbar isShowHorizontalScrollbar>
            <AntdDropdown
                menu={{
                    items: menuItems,
                    onClick: ({ key: action }) => {
                        if (!rightClickNode) {
                            return
                        }
                        switch (action) {
                            case 'new_file':
                            case 'new_dir':
                            case 'rename':
                                fileNameForm.setFieldValue(
                                    'fileName',
                                    action === 'new_file' || action === 'new_dir'
                                        ? ''
                                        : rightClickNode.node.fileName
                                )
                                void modal.confirm({
                                    centered: true,
                                    icon: (
                                        <Icon
                                            style={{ color: theme.colorText }}
                                            component={
                                                action === 'new_file' ||
                                                (action === 'rename' &&
                                                    !rightClickNode.node.children)
                                                    ? IconOxygenFile
                                                    : IconOxygenDirectory
                                            }
                                        />
                                    ),
                                    title:
                                        action === 'new_file'
                                            ? '新文件'
                                            : action === 'new_dir'
                                              ? '新目录'
                                              : '重命名',
                                    content: (
                                        <AntdForm
                                            form={fileNameForm}
                                            ref={() => {
                                                setTimeout(() => {
                                                    fileNameForm
                                                        .getFieldInstance('fileName')
                                                        ?.focus()
                                                }, 50)
                                            }}
                                        >
                                            <AntdForm.Item
                                                name={'fileName'}
                                                style={{ marginTop: 10 }}
                                                rules={[
                                                    {
                                                        required: true,
                                                        whitespace: true,
                                                        message: '不能为空'
                                                    },
                                                    {
                                                        pattern: /^[a-zA-Z0-9_\-. ]{1,40}$/,
                                                        message: '包含非法字符'
                                                    },
                                                    action === 'new_file' ||
                                                    (action === 'rename' &&
                                                        !rightClickNode.node.children)
                                                        ? {
                                                              pattern:
                                                                  /^.*\.(jsx|tsx|js|ts|css|json)$/,
                                                              message:
                                                                  '仅支持 *.jsx, *.tsx, *.js, *.ts, *.css, *.json 文件'
                                                          }
                                                        : {}
                                                ]}
                                            >
                                                <AntdInput
                                                    showCount
                                                    maxLength={40}
                                                    autoComplete={'off'}
                                                />
                                            </AntdForm.Item>
                                        </AntdForm>
                                    ),
                                    onOk: () =>
                                        fileNameForm.validateFields().then(
                                            () => {
                                                return new Promise<void>((resolve) => {
                                                    switch (action) {
                                                        case 'new_dir':
                                                        case 'new_file':
                                                            onAdd?.(
                                                                fileNameForm.getFieldValue(
                                                                    'fileName'
                                                                ),
                                                                action === 'new_dir',
                                                                !rightClickNode.node.children
                                                                    ? rightClickNode.parent!.key
                                                                    : rightClickNode.node.key
                                                            )
                                                            setExpandedKeys((prev) => [
                                                                ...new Set([
                                                                    ...prev,
                                                                    rightClickNode.node.key
                                                                ])
                                                            ])
                                                            break
                                                        case 'rename':
                                                            onRename?.(
                                                                rightClickNode.node.key,
                                                                fileNameForm.getFieldValue(
                                                                    'fileName'
                                                                )
                                                            )
                                                    }
                                                    resolve()
                                                })
                                            },
                                            () => {
                                                return new Promise((_, reject) => {
                                                    reject('输入有误')
                                                })
                                            }
                                        )
                                })
                                break
                            case 'delete':
                                modal
                                    .confirm({
                                        centered: true,
                                        icon: (
                                            <Icon
                                                style={{ color: theme.colorText }}
                                                component={
                                                    !rightClickNode.node.children
                                                        ? IconOxygenFile
                                                        : IconOxygenDirectory
                                                }
                                            />
                                        ),
                                        title: '删除',
                                        content: `删除${!rightClickNode.node.children ? '文件' : '目录'} "${rightClickNode.node.fileName}"？`
                                    })
                                    .then(
                                        (confirmed) => {
                                            confirmed && onRemove?.(rightClickNode?.node.key)
                                        },
                                        () => {}
                                    )
                                break
                        }
                    }
                }}
                trigger={['contextMenu']}
                open={isMenuOpen}
                onOpenChange={setIsMenuOpen}
            >
                <AntdTree.DirectoryTree
                    className={styles.dirTree}
                    treeData={treeData}
                    selectedKeys={[selectedKey]}
                    draggable={{ icon: <></> }}
                    expandedKeys={expandedKeys}
                    onSelect={handleOnSelect}
                    onRightClick={({ node: { key } }) => handleOnRightClick(key as string)}
                    onExpand={setExpandedKeys}
                    onDragStart={() => setIsMenuOpen(false)}
                    onDrop={({ dragNode: { key }, node: { key: t } }) => {
                        const target = t as string
                        const node = findNodeByKey(fileTree, target)
                        if (!node) {
                            return
                        }
                        handleOnDrop(key as string, !node.node.children ? node.parent!.key : target)
                    }}
                />
            </AntdDropdown>
        </HideScrollbar>
    )
}

export default FileExplorer
