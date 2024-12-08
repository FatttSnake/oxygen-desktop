import { Dispatch, SetStateAction, KeyboardEvent, ChangeEvent, MouseEvent } from 'react'
import useStyles from '@/components/Playground/CodeEditor/FileSelector/item.style'

interface ItemProps {
    className?: string
    readonly?: boolean
    creating?: boolean
    value: string
    active?: boolean
    hasEditing?: boolean
    setHasEditing?: Dispatch<SetStateAction<boolean>>
    onOk?: (fileName: string) => void
    onCancel?: () => void
    onRemove?: (fileName: string) => void
    onClick?: () => void
    onValidate?: (newFileName: string, oldFileName: string) => boolean
}

const Item = ({
    className,
    readonly = false,
    value,
    active = false,
    hasEditing,
    setHasEditing,
    onOk,
    onCancel,
    onRemove,
    onClick,
    onValidate,
    ...prop
}: ItemProps) => {
    const { styles, cx } = useStyles()
    const inputRef = useRef<HTMLInputElement>(null)
    const [fileName, setFileName] = useState(value)
    const [isCreating, setIsCreating] = useState(prop.creating)

    const handleOnClick = () => {
        if (hasEditing) {
            return
        }

        onClick?.()
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            finishNameFile()
        } else if (event.key === 'Escape') {
            event.preventDefault()
            cancelNameFile()
        }
    }

    const finishNameFile = () => {
        if (!isCreating || onValidate ? !onValidate?.(fileName, value) : false) {
            inputRef.current?.focus()
            return
        }

        if (fileName === value && active) {
            setIsCreating(false)
            setHasEditing?.(false)
            return
        }

        onOk?.(fileName)
        setIsCreating(false)
        setHasEditing?.(false)
    }

    const cancelNameFile = () => {
        setFileName(value)
        setIsCreating(false)
        setHasEditing?.(false)
        onCancel?.()
    }

    const handleOnDoubleClick = () => {
        if (readonly || isCreating || hasEditing) {
            return
        }

        setIsCreating(true)
        setHasEditing?.(true)
        setFileName(value)
        setTimeout(() => {
            inputRef.current?.focus()
            inputRef.current?.setSelectionRange(0, inputRef.current?.value.lastIndexOf('.'))
        })
    }

    const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFileName(e.target.value)
    }

    const handleOnDelete = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        if (hasEditing) {
            return
        }
        if (confirm(`确定删除文件 ${value} ？`)) {
            onRemove?.(value)
        }
    }

    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    return (
        <div
            className={cx(styles.root, active ? styles.active : '', className)}
            onClick={handleOnClick}
        >
            {isCreating ? (
                <div className={styles.tabItemInput}>
                    <input
                        ref={inputRef}
                        value={fileName}
                        onChange={handleOnChange}
                        onBlur={finishNameFile}
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
