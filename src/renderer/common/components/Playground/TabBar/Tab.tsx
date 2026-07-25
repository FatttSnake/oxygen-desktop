import { KeyboardEvent, ChangeEvent, MouseEvent } from 'react'
import useStyles from '$/assets/css/components/playground/tab-bar/tab-item.style'

interface TabProps {
    className?: string
    value: string
    active?: boolean
    closable?: boolean
    editable?: boolean
    editing?: boolean
    onClick?: () => void
    onClose?: () => void
    onEditing?: () => void
    onRename?: (newValue: string) => boolean
    onCancel?: () => void
}

const Tab = ({
    className,
    value,
    active = false,
    closable = true,
    editable = false,
    editing = false,
    onClick,
    onClose,
    onEditing,
    onRename,
    onCancel
}: TabProps) => {
    const { styles, cx } = useStyles()
    const inputRef = useRef<HTMLInputElement>(null)
    const [tabName, setTabName] = useState(value)

    const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
        setTabName(e.target.value)
    }

    const handleOnFinish = () => {
        if (onRename?.(tabName) ?? true) {
            return
        }

        inputRef.current?.focus()
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            onRename?.(tabName)
        } else if (event.key === 'Escape') {
            event.preventDefault()
            setTabName(value)
            onCancel?.()
        }
    }

    const handleOnDoubleClick = () => {
        if (!editable || editing) {
            return
        }

        onEditing?.()
        setTimeout(() => {
            inputRef.current?.focus()
            inputRef.current?.setSelectionRange(0, inputRef.current?.value.length)
        })
    }

    const handleOnClose = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        if (!closable) {
            return
        }

        onClose?.()
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
                        value={tabName}
                        onChange={handleOnChange}
                        onBlur={handleOnFinish}
                        onKeyDown={handleKeyDown}
                        spellCheck={'false'}
                    />
                    <span className={styles.tabItemInputMask}>{tabName}</span>
                </div>
            ) : (
                <>
                    <div onDoubleClick={handleOnDoubleClick}>{value}</div>
                    {closable && (
                        <div className={styles.tabItemClose} onClick={handleOnClose}>
                            <IconOxygenClose />
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default Tab
