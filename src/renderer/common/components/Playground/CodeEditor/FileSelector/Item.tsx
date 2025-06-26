import { KeyboardEvent, ChangeEvent, MouseEvent } from 'react'
import useStyles from '$/assets/css/components/playground/code-editor/file-selector-item.style'
import { modal } from '$/util/common'

interface ItemProps {
    className?: string
    value: string
    active?: boolean
    readonly?: boolean
    editing?: boolean
    onClick?: () => void
    onEditing?: () => void
    onChange?: (newValue: string) => boolean
    onCancel?: () => void
    onRemove?: () => void
}

const Item = ({
    className,
    value,
    active = false,
    readonly = false,
    editing = false,
    onClick,
    onEditing,
    onChange,
    onCancel,
    onRemove
}: ItemProps) => {
    const { styles, cx } = useStyles()
    const inputRef = useRef<HTMLInputElement>(null)
    const [fileName, setFileName] = useState(value)

    const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFileName(e.target.value)
    }

    const handleOnFinish = () => {
        if (onChange?.(fileName) ?? true) {
            return
        }

        inputRef.current?.focus()
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            onChange?.(fileName)
        } else if (event.key === 'Escape') {
            event.preventDefault()
            setFileName(value)
            onCancel?.()
        }
    }

    const handleOnDoubleClick = () => {
        if (readonly || editing) {
            return
        }

        onEditing?.()
        setFileName(value)
        setTimeout(() => {
            inputRef.current?.focus()
            inputRef.current?.setSelectionRange(0, inputRef.current?.value.lastIndexOf('.'))
        })
    }

    const handleOnDelete = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        modal
            .confirm({
                centered: true,
                maskClosable: true,
                title: '确定删除',
                content: `确定删除文件 ${value} 吗？`
            })
            .then(
                (confirmed) => {
                    if (confirmed) {
                        onRemove?.()
                    }
                },
                () => {}
            )
    }

    useEffect(() => {
        if (editing) {
            inputRef.current?.focus()
        }
    }, [])

    return (
        <div className={cx(styles.root, active ? styles.active : '', className)} onClick={onClick}>
            {editing ? (
                <div className={styles.tabItemInput}>
                    <input
                        ref={inputRef}
                        value={fileName}
                        onChange={handleOnChange}
                        onBlur={handleOnFinish}
                        onKeyDown={handleKeyDown}
                        spellCheck={'false'}
                    />
                    <span className={styles.tabItemInputMask}>{fileName}</span>
                </div>
            ) : (
                <>
                    <div onDoubleClick={handleOnDoubleClick}>{value}</div>
                    {!readonly && (
                        <div className={styles.tabItemClose} onClick={handleOnDelete}>
                            <IconOxygenClose />
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default Item
