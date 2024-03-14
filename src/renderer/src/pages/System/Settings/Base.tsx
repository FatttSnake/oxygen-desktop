import { hasPermission } from '@/util/auth'
import { r_sys_settings_base_get, r_sys_settings_base_update } from '@/services/system'
import { SettingsCard } from '@/pages/System/Settings'

const Base = () => {
    const [baseForm] = AntdForm.useForm<BaseSettingsParam>()
    const baseFormValues = AntdForm.useWatch([], baseForm)
    const [loading, setLoading] = useState(false)

    const handleOnReset = () => {
        getBaseSettings()
    }

    const handleOnSave = () => {
        void r_sys_settings_base_update(baseFormValues).then((res) => {
            const response = res.data
            if (response.success) {
                void message.success('保存设置成功')
                getBaseSettings()
            } else {
                void message.error('保存设置失败，请稍后重试')
            }
        })
    }

    const getBaseSettings = () => {
        if (loading) {
            return
        }
        setLoading(true)

        void r_sys_settings_base_get().then((res) => {
            const response = res.data
            if (response.success) {
                const data = response.data
                data && baseForm.setFieldsValue(data)
                setLoading(false)
            }
        })
    }

    useEffect(() => {
        getBaseSettings()
    }, [])

    return (
        <>
            <SettingsCard
                icon={IconOxygenBase}
                title={'基础'}
                loading={loading}
                onReset={handleOnReset}
                onSave={handleOnSave}
                modifyOperationCode={['system:settings:modify:base']}
            >
                <AntdForm
                    form={baseForm}
                    labelCol={{ flex: '7em' }}
                    disabled={!hasPermission('system:settings:modify:base')}
                >
                    <AntdForm.Item label={'应用名称'} name={'appName'}>
                        <AntdInput />
                    </AntdForm.Item>
                    <AntdForm.Item label={'应用 URL'} name={'appUrl'}>
                        <AntdInput />
                    </AntdForm.Item>
                    <AntdForm.Item label={'验证邮箱 URL'} name={'verifyUrl'}>
                        <AntdInput placeholder={'验证码使用 ${verifyCode} 代替'} />
                    </AntdForm.Item>
                    <AntdForm.Item label={'找回密码 URL'} name={'retrieveUrl'}>
                        <AntdInput placeholder={'验证码使用 ${retrieveCode} 代替'} />
                    </AntdForm.Item>
                </AntdForm>
            </SettingsCard>
        </>
    )
}

export default Base
