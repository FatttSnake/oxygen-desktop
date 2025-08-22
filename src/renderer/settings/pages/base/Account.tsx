import Icon from '@ant-design/icons'
import useStyles from '%/assets/css/pages/base/account.style'
import {
    DATABASE_UPDATE_SUCCESS,
    PERMISSION_ACCESS_DENIED,
    PERMISSION_LOGIN_USERNAME_PASSWORD_ERROR
} from '$/constants/common.constants'
import { message, modal, notification } from '$/util/common'
import { utcToLocalTime } from '$/util/datetime'
import { getUserInfo, removeAllToken } from '$/util/auth'
import { r_sys_user_info_change_password, r_sys_user_info_update } from '$/services/system'
import {
    r_auth_two_factor_create,
    r_auth_two_factor_remove,
    r_auth_two_factor_validate
} from '$/services/auth'
import { r_api_avatar_random_base64 } from '$/services/api/avatar'
import FitCenter from '$/components/FitCenter'
import FitFullscreen from '$/components/FitFullscreen'
import HideScrollbar from '$/components/HideScrollbar'
import SettingsControl from '%/components/SettingsControl'

const Account = () => {
    const { styles, theme } = useStyles()
    const [userInfoForm] = AntdForm.useForm<UserInfoUpdateParam>()
    const [twoFactorForm] = AntdForm.useForm<{ twoFactorCode: string }>()
    const [changePasswordForm] = AntdForm.useForm<UserChangePasswordParam>()
    const [userInfo, setUserInfo] = useState<UserWithPowerInfoVo>()
    const [isLoading, setIsLoading] = useState(false)

    const handleOnChangeAvatar = () => {
        if (isLoading || !userInfo) {
            return
        }
        setIsLoading(true)
        userInfoForm.resetFields()
        void message.loading({ content: '获取中……', key: 'LOADING', duration: 0 })
        r_api_avatar_random_base64()
            .then((res) => {
                message.destroy('LOADING')
                const response = res.data
                if (response.success) {
                    userInfoForm.setFieldValue('avatar', response.data?.base64)
                    void modal.confirm({
                        centered: true,
                        maskClosable: true,
                        icon: (
                            <Icon
                                style={{ color: theme.colorPrimary }}
                                component={IconOxygenUser}
                            />
                        ),
                        title: '更换头像',
                        footer: (_, { OkBtn, CancelBtn }) => (
                            <>
                                <OkBtn />
                                <CancelBtn />
                            </>
                        ),
                        content: (
                            <FitCenter style={{ padding: theme.paddingXL }}>
                                <AntdImage src={`data:image/png;base64,${response.data?.base64}`} />
                            </FitCenter>
                        ),
                        onOk: () =>
                            new Promise<void>((resolve) => {
                                r_sys_user_info_update({
                                    avatar: userInfoForm.getFieldValue('avatar')
                                })
                                    .then((res) => {
                                        const response = res.data
                                        if (response.success) {
                                            void message.success('更换成功')
                                            refreshUserInfo(true)
                                        } else {
                                            void message.error('更换失败，请稍后重试')
                                        }
                                    })
                                    .finally(() => {
                                        resolve()
                                    })
                            })
                    })
                } else {
                    void message.error('获取新头像失败，请稍后重试')
                }
            })
            .catch(() => {
                message.destroy('LOADING')
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    const handleOnChangeNickname = () => {
        if (isLoading || !userInfo) {
            return
        }
        userInfoForm.resetFields()
        userInfoForm.setFieldValue('nickname', userInfo.userInfo.nickname)
        void modal.confirm({
            centered: true,
            maskClosable: true,
            icon: <Icon style={{ color: theme.colorPrimary }} component={IconOxygenUser} />,
            title: '修改昵称',
            footer: (_, { OkBtn, CancelBtn }) => (
                <>
                    <OkBtn />
                    <CancelBtn />
                </>
            ),
            content: (
                <AntdForm form={userInfoForm} style={{ paddingTop: theme.paddingXL }}>
                    <AntdForm.Item
                        name={'nickname'}
                        rules={[
                            { required: true, whitespace: true },
                            { min: 3, message: '昵称至少为3个字符' }
                        ]}
                    >
                        <AntdInput maxLength={20} showCount placeholder={'请输入昵称'} />
                    </AntdForm.Item>
                </AntdForm>
            ),
            onOk: () =>
                new Promise<void>((resolve) => {
                    r_sys_user_info_update({
                        nickname: userInfoForm.getFieldValue('nickname')
                    })
                        .then((res) => {
                            const response = res.data
                            if (response.success) {
                                void message.success('修改成功')
                                refreshUserInfo(true)
                            } else {
                                void message.error('修改失败，请稍后重试')
                            }
                        })
                        .finally(() => {
                            resolve()
                        })
                })
        })
    }

    const handleOnChangePassword = () => {
        if (isLoading || !userInfo) {
            return
        }

        changePasswordForm.resetFields()

        void modal.confirm({
            centered: true,
            maskClosable: true,
            icon: <Icon style={{ color: theme.colorPrimary }} component={IconOxygenPassword} />,
            title: '修改密码',
            footer: (_, { OkBtn, CancelBtn }) => (
                <>
                    <OkBtn />
                    <CancelBtn />
                </>
            ),
            content: (
                <AntdForm
                    form={changePasswordForm}
                    style={{ marginTop: 20 }}
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    ref={() => {
                        setTimeout(
                            () => changePasswordForm?.getFieldInstance('originalPassword')?.focus(),
                            50
                        )
                    }}
                >
                    <AntdForm.Item
                        name={'originalPassword'}
                        label={'原密码'}
                        labelAlign={'right'}
                        rules={[{ required: true, whitespace: true }]}
                    >
                        <AntdInput.Password placeholder={'请输入原密码'} />
                    </AntdForm.Item>
                    <AntdForm.Item
                        name={'newPassword'}
                        label={'新密码'}
                        labelAlign={'right'}
                        rules={[
                            { required: true, whitespace: true },
                            { min: 10, message: '密码至少为10位' },
                            { max: 30, message: '密码最多为30位' }
                        ]}
                    >
                        <AntdInput.Password placeholder={'请输入新密码'} />
                    </AntdForm.Item>
                    <AntdForm.Item
                        name={'newPasswordConfirm'}
                        label={'确认密码'}
                        labelAlign={'right'}
                        rules={[
                            { required: true },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve()
                                    }
                                    return Promise.reject(Error('两次密码输入必须一致'))
                                }
                            })
                        ]}
                    >
                        <AntdInput.Password placeholder={'请确认密码'} />
                    </AntdForm.Item>
                </AntdForm>
            ),
            onOk: () =>
                changePasswordForm.validateFields().then(
                    () =>
                        new Promise<void>((resolve, reject) => {
                            r_sys_user_info_change_password({
                                originalPassword: changePasswordForm.getFieldValue(
                                    'originalPassword'
                                ) as string,
                                newPassword: changePasswordForm.getFieldValue(
                                    'newPassword'
                                ) as string
                            }).then((res) => {
                                const response = res.data
                                switch (response.code) {
                                    case DATABASE_UPDATE_SUCCESS:
                                        removeAllToken()
                                        notification.info({
                                            message: '已退出登录',
                                            icon: (
                                                <Icon
                                                    component={IconOxygenExit}
                                                    style={{ color: theme.colorErrorText }}
                                                />
                                            )
                                        })
                                        message.success('密码修改成功，请重新登录').then(() => {
                                            window.location.reload()
                                        })
                                        resolve()
                                        break
                                    case PERMISSION_ACCESS_DENIED:
                                        void message.error('拒绝访问')
                                        resolve()
                                        break
                                    case PERMISSION_LOGIN_USERNAME_PASSWORD_ERROR:
                                        void message.warning('原密码错误，请重新输入')
                                        reject(response.msg)
                                        break
                                    default:
                                        void message.error('出错了，请稍后重试')
                                        resolve()
                                }
                            })
                        }),
                    () =>
                        new Promise((_, reject) => {
                            reject('输入有误')
                        })
                )
        })
    }

    const handleOnChange2FA = () => {
        if (isLoading || !userInfo) {
            return
        }

        twoFactorForm.resetFields()

        if (userInfo.twoFactor) {
            void modal.confirm({
                centered: true,
                maskClosable: true,
                focusTriggerAfterClose: false,
                icon: <Icon style={{ color: theme.colorPrimary }} component={IconOxygen2fa} />,
                title: '移除 2FA',
                footer: (_, { OkBtn, CancelBtn }) => (
                    <>
                        <OkBtn />
                        <CancelBtn />
                    </>
                ),
                content: '确定移除 2FA ？',
                onOk: () => {
                    void modal.confirm({
                        centered: true,
                        maskClosable: true,
                        icon: (
                            <Icon style={{ color: theme.colorPrimary }} component={IconOxygen2fa} />
                        ),
                        title: '移除 2FA',
                        footer: (_, { OkBtn, CancelBtn }) => (
                            <>
                                <OkBtn />
                                <CancelBtn />
                            </>
                        ),
                        content: (
                            <AntdForm
                                form={twoFactorForm}
                                ref={() => {
                                    setTimeout(() => {
                                        twoFactorForm?.getFieldInstance('twoFactorCode')?.focus()
                                    }, 50)
                                }}
                            >
                                <AntdForm.Item
                                    name={'twoFactorCode'}
                                    label={'验证码'}
                                    style={{ marginTop: 10 }}
                                    rules={[{ required: true, whitespace: true, len: 6 }]}
                                >
                                    <AntdInput
                                        showCount
                                        maxLength={6}
                                        autoComplete={'off'}
                                        placeholder={'请输入验证码'}
                                    />
                                </AntdForm.Item>
                            </AntdForm>
                        ),
                        onOk: () =>
                            twoFactorForm.validateFields().then(
                                () =>
                                    new Promise<void>((resolve) => {
                                        r_auth_two_factor_remove({
                                            code: twoFactorForm.getFieldValue(
                                                'twoFactorCode'
                                            ) as string
                                        })
                                            .then((res) => {
                                                const response = res.data
                                                if (response.success) {
                                                    void message.success('移除成功')
                                                    refreshUserInfo(true)
                                                } else {
                                                    void message.error('移除失败，请稍后重试')
                                                }
                                            })
                                            .finally(() => {
                                                resolve()
                                            })
                                    }),
                                () =>
                                    new Promise((_, reject) => {
                                        reject('输入有误')
                                    })
                            )
                    })
                }
            })
        } else {
            setIsLoading(true)
            void message.loading({ content: '加载中……', key: 'LOADING', duration: 0 })
            r_auth_two_factor_create()
                .then((res) => {
                    message.destroy('LOADING')
                    const response = res.data
                    if (response.success) {
                        void modal.confirm({
                            centered: true,
                            maskClosable: true,
                            icon: (
                                <Icon
                                    style={{ color: theme.colorPrimary }}
                                    component={IconOxygen2fa}
                                />
                            ),
                            title: '配置 2FA',
                            footer: (_, { OkBtn, CancelBtn }) => (
                                <>
                                    <OkBtn />
                                    <CancelBtn />
                                </>
                            ),
                            content: (
                                <>
                                    <div
                                        className={styles.qrCode}
                                        style={{
                                            maskImage: `url(data:image/svg+xml;base64,${response.data?.qrCodeSVGBase64})`
                                        }}
                                    />
                                    <AntdTag style={{ whiteSpace: 'normal' }}>
                                        请使用身份验证器APP（eg. Microsoft Authenticator, Google
                                        Authenticator）扫描二维码，并在下方输入显示的动态二维码进行绑定
                                    </AntdTag>
                                    <AntdForm
                                        form={twoFactorForm}
                                        ref={() => {
                                            setTimeout(() => {
                                                twoFactorForm
                                                    ?.getFieldInstance('twoFactorCode')
                                                    ?.focus()
                                            }, 50)
                                        }}
                                    >
                                        <AntdForm.Item
                                            name={'twoFactorCode'}
                                            label={'验证码'}
                                            style={{ marginTop: 10, marginRight: 30 }}
                                            rules={[{ required: true, whitespace: true, len: 6 }]}
                                        >
                                            <AntdInput
                                                showCount
                                                maxLength={6}
                                                autoComplete={'off'}
                                                placeholder={'请输入验证码'}
                                            />
                                        </AntdForm.Item>
                                    </AntdForm>
                                </>
                            ),
                            onOk: () =>
                                twoFactorForm.validateFields().then(
                                    () =>
                                        new Promise<void>((resolve) => {
                                            r_auth_two_factor_validate({
                                                code: twoFactorForm.getFieldValue(
                                                    'twoFactorCode'
                                                ) as string
                                            })
                                                .then((res) => {
                                                    const response = res.data
                                                    if (response.success) {
                                                        void message.success('绑定成功')
                                                        refreshUserInfo(true)
                                                    } else {
                                                        void message.error('绑定失败，请稍后重试')
                                                    }
                                                })
                                                .finally(() => {
                                                    resolve()
                                                })
                                        }),
                                    () =>
                                        new Promise((_, reject) => {
                                            reject('输入有误')
                                        })
                                )
                        })
                    } else {
                        void message.error('获取双因素绑定二维码失败，请稍后重试')
                    }
                })
                .catch(() => {
                    message.destroy('LOADING')
                })
                .finally(() => {
                    setIsLoading(false)
                })
        }
    }

    const refreshUserInfo = (force?: boolean) => {
        if (isLoading) {
            return
        }
        setIsLoading(true)

        getUserInfo(force)
            .then((userInfo) => {
                setUserInfo(userInfo)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    useEffect(() => {
        refreshUserInfo()
    }, [])

    return (
        <FitFullscreen>
            <HideScrollbar isShowVerticalScrollbar autoHideWaitingTime={1000}>
                <SettingsControl header={'账户'}>
                    <SettingsControl.User
                        avatar={userInfo?.userInfo.avatar}
                        nickname={userInfo?.userInfo.nickname}
                        username={userInfo?.username}
                        isLoading={isLoading}
                        onClickAvatar={handleOnChangeAvatar}
                        onClickChangeNickname={handleOnChangeNickname}
                    />
                    <SettingsControl.Group title={'基础'}>
                        <SettingsControl.Item
                            icon={IconOxygenUser}
                            name={'用户名'}
                            desc={'用于用户登录和身份识别'}
                        >
                            {userInfo?.username}
                        </SettingsControl.Item>
                        <SettingsControl.Item
                            icon={IconOxygenEmail}
                            name={'邮箱'}
                            desc={'用于用户登录和邮件接收'}
                        >
                            {userInfo?.userInfo.email}
                        </SettingsControl.Item>
                        <SettingsControl.Item
                            icon={IconOxygenRegister}
                            name={'注册时间'}
                            desc={'账户创建时间'}
                        >
                            {userInfo && utcToLocalTime(userInfo.createTime)}
                        </SettingsControl.Item>
                    </SettingsControl.Group>
                    <SettingsControl.Group title={'安全'}>
                        <SettingsControl.Item
                            icon={IconOxygenIp}
                            name={'上次登录 IP'}
                            desc={'如果发现登录 IP 异常，请尽快更改密码并检查账户安全'}
                        >
                            {userInfo && userInfo.lastLoginIp}
                        </SettingsControl.Item>
                        <SettingsControl.Item
                            icon={IconOxygenTime}
                            name={'上次登录时间'}
                            desc={'如果发现登录时间异常，请尽快更改密码并检查账户安全'}
                        >
                            {userInfo && utcToLocalTime(userInfo.lastLoginTime)}
                        </SettingsControl.Item>
                        <SettingsControl.Item
                            icon={IconOxygenPassword}
                            name={'密码'}
                            desc={'用于保护账户安全'}
                        >
                            <AntdTooltip title={'修改密码'}>
                                <AntdButton
                                    disabled={isLoading || !userInfo}
                                    onClick={handleOnChangePassword}
                                >
                                    <Icon component={IconOxygenRefresh} />
                                </AntdButton>
                            </AntdTooltip>
                        </SettingsControl.Item>
                        <SettingsControl.Item icon={IconOxygen2fa} name={'2FA'} desc={'双因素认证'}>
                            <AntdTooltip title={userInfo?.twoFactor ? '移除' : '配置'}>
                                <AntdButton
                                    disabled={isLoading || !userInfo}
                                    onClick={handleOnChange2FA}
                                >
                                    <Icon
                                        component={
                                            userInfo?.twoFactor ? IconOxygenUnlock : IconOxygenLock
                                        }
                                    />
                                </AntdButton>
                            </AntdTooltip>
                        </SettingsControl.Item>
                    </SettingsControl.Group>
                </SettingsControl>
            </HideScrollbar>
        </FitFullscreen>
    )
}

export default Account
