import { message } from '@/util/common'
import { hasPermission } from '@/util/auth'
import { r_sys_settings_two_factor_get, r_sys_settings_two_factor_update } from '@/services/system'
import SettingsCard from '@/components/system/SettingCard'

const TwoFactor = () => {
    const [twoFactorForm] = AntdForm.useForm<TwoFactorSettingsParam>()
    const twoFactorFormValues = AntdForm.useWatch([], twoFactorForm)
    const [isLoading, setIsLoading] = useState(false)

    const handleOnReset = () => {
        getTwoFactorSettings()
    }

    const handleOnSave = () => {
        void r_sys_settings_two_factor_update(twoFactorFormValues).then((res) => {
            const response = res.data
            if (response.success) {
                void message.success('保存设置成功')
                getTwoFactorSettings()
            } else {
                void message.error('保存设置失败，请稍后重试')
            }
        })
    }

    const getTwoFactorSettings = () => {
        if (isLoading) {
            return
        }
        setIsLoading(true)

        void r_sys_settings_two_factor_get().then((res) => {
            const response = res.data
            if (response.success) {
                const data = response.data
                data && twoFactorForm.setFieldsValue(data)
                setIsLoading(false)
            }
        })
    }

    useEffect(() => {
        getTwoFactorSettings()
    }, [])

    return (
        <>
            <SettingsCard
                icon={IconOxygenSafe}
                title={'双因素'}
                loading={isLoading}
                onReset={handleOnReset}
                onSave={handleOnSave}
                modifyOperationCode={['system:settings:modify:two-factor']}
            >
                <AntdForm
                    form={twoFactorForm}
                    labelCol={{ flex: '7em' }}
                    disabled={!hasPermission('system:settings:modify:two-factor')}
                >
                    <AntdForm.Item label={'提供者'} name={'issuer'}>
                        <AntdInput placeholder={'请输入提供者'} />
                    </AntdForm.Item>
                    <AntdForm.Item label={'密钥长度'} name={'secretKeyLength'}>
                        <AntdInputNumber
                            min={3}
                            max={64}
                            style={{ width: '100%' }}
                            placeholder={'请输入密钥长度'}
                        />
                    </AntdForm.Item>
                </AntdForm>
            </SettingsCard>
        </>
    )
}

export default TwoFactor
