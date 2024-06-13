import Icon from '@ant-design/icons'
import { hasPermission } from '@/util/auth'
import {
    r_sys_settings_mail_get,
    r_sys_settings_mail_send,
    r_sys_settings_mail_update
} from '@/services/system'
import SettingsCard from '@/components/system/SettingCard'

const Mail = () => {
    const [modal, contextHolder] = AntdModal.useModal()
    const [mailForm] = AntdForm.useForm<MailSettingsParam>()
    const mailFormValues = AntdForm.useWatch([], mailForm)
    const [isLoading, setIsLoading] = useState(false)
    const [mailSendForm] = AntdForm.useForm<MailSendParam>()

    const handleOnTest = () => {
        void modal.confirm({
            centered: true,
            maskClosable: true,
            title: '发送测试邮件',
            footer: (_, { OkBtn, CancelBtn }) => (
                <>
                    <OkBtn />
                    <CancelBtn />
                </>
            ),
            content: (
                <>
                    <AntdForm
                        form={mailSendForm}
                        ref={() => {
                            setTimeout(() => {
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
                                mailSendForm?.getFieldInstance('to').focus()
                            }, 50)
                        }}
                    >
                        <AntdForm.Item
                            name={'to'}
                            label={'接收人'}
                            style={{ marginTop: 10 }}
                            rules={[{ required: true, type: 'email' }]}
                        >
                            <AntdInput placeholder={'请输入接收人'} />
                        </AntdForm.Item>
                    </AntdForm>
                    <AntdTag style={{ whiteSpace: 'normal' }}>
                        将使用服务器已保存的邮件设置进行发送邮件，请保证编辑的内容已保存
                    </AntdTag>
                </>
            ),
            onOk: () =>
                mailSendForm.validateFields().then(
                    () => {
                        return new Promise<void>((resolve) => {
                            void r_sys_settings_mail_send({
                                to: mailSendForm.getFieldValue('to') as string
                            }).then((res) => {
                                const response = res.data

                                if (response.success) {
                                    void message.success('发送成功')
                                    resolve()
                                } else {
                                    void message.error('发送失败，请检查配置后重试')
                                    resolve()
                                }
                            })
                        })
                    },
                    () => {
                        return new Promise((_, reject) => {
                            reject('输入有误')
                        })
                    }
                )
        })
    }

    const handleOnReset = () => {
        getMailSettings()
    }

    const handleOnSave = () => {
        void r_sys_settings_mail_update(mailFormValues).then((res) => {
            const response = res.data
            if (response.success) {
                void message.success('保存设置成功')
                getMailSettings()
            } else {
                void message.error('保存设置失败，请稍后重试')
            }
        })
    }

    const getMailSettings = () => {
        if (isLoading) {
            return
        }

        setIsLoading(true)
        void r_sys_settings_mail_get().then((res) => {
            const response = res.data
            if (response.success) {
                const data = response.data
                data && mailForm.setFieldsValue(data)
                setIsLoading(false)
            }
        })
    }

    useEffect(() => {
        getMailSettings()
    }, [])

    return (
        <>
            <SettingsCard
                icon={IconOxygenEmail}
                title={'邮件'}
                loading={isLoading}
                onReset={handleOnReset}
                onSave={handleOnSave}
                modifyOperationCode={['system:settings:modify:mail']}
                expand={
                    <AntdButton onClick={handleOnTest} title={'测试'}>
                        <Icon component={IconOxygenTest} />
                    </AntdButton>
                }
            >
                <AntdForm
                    form={mailForm}
                    labelCol={{ flex: '8em' }}
                    disabled={!hasPermission('system:settings:modify:mail')}
                >
                    <AntdForm.Item label={'SMTP 服务器'} name={'host'}>
                        <AntdInput placeholder={'请输入 SMTP 服务器'} />
                    </AntdForm.Item>
                    <AntdForm.Item label={'端口号'} name={'port'}>
                        <AntdInputNumber
                            min={0}
                            max={65535}
                            style={{ width: '100%' }}
                            placeholder={'请输入端口号'}
                        />
                    </AntdForm.Item>
                    <AntdForm.Item label={'安全类型'} name={'securityType'}>
                        <AntdSelect placeholder={'请选择安全类型'}>
                            <AntdSelect.Option key={'None'}>None</AntdSelect.Option>
                            <AntdSelect.Option key={'SSL/TLS'}>SSL/TLS</AntdSelect.Option>
                            <AntdSelect.Option key={'StartTls'}>StartTls</AntdSelect.Option>
                        </AntdSelect>
                    </AntdForm.Item>
                    <AntdForm.Item label={'用户名'} name={'username'}>
                        <AntdInput placeholder={'请输入用户名'} />
                    </AntdForm.Item>
                    <AntdForm.Item label={'密码'} name={'password'}>
                        <AntdInput.Password placeholder={'请输入密码'} />
                    </AntdForm.Item>
                    <AntdForm.Item label={'发送者'} name={'from'}>
                        <AntdInput placeholder={'请输入发送者'} />
                    </AntdForm.Item>
                    <AntdForm.Item label={'发送者名称'} name={'fromName'}>
                        <AntdInput placeholder={'请输入发送者名称'} />
                    </AntdForm.Item>
                </AntdForm>
            </SettingsCard>
            {contextHolder}
        </>
    )
}

export default Mail
