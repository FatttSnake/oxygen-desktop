import Icon from '@ant-design/icons'
import '@/assets/css/pages/user/index.scss'
import {
    COLOR_BACKGROUND,
    COLOR_ERROR,
    COLOR_PRODUCTION,
    DATABASE_UPDATE_SUCCESS,
    PERMISSION_ACCESS_DENIED,
    PERMISSION_LOGIN_USERNAME_PASSWORD_ERROR
} from '@/constants/common.constants'
import { utcToLocalTime } from '@/util/datetime'
import { getUserInfo, removeToken } from '@/util/auth'
import { r_sys_user_info_change_password, r_sys_user_info_update } from '@/services/system'
import {
    r_auth_two_factor_create,
    r_auth_two_factor_remove,
    r_auth_two_factor_validate
} from '@/services/auth'
import { r_api_avatar_random_base64 } from '@/services/api/avatar'
import FitFullscreen from '@/components/common/FitFullscreen'
import Card from '@/components/common/Card'
import FlexBox from '@/components/common/FlexBox'
import HideScrollbar from '@/components/common/HideScrollbar'

interface ChangePasswordFields extends UserUpdatePasswordParam {
    newPasswordConfirm: string
}

const User = () => {
    const [modal, contextHolder] = AntdModal.useModal()
    const [form] = AntdForm.useForm<UserInfoUpdateParam>()
    const formValues = AntdForm.useWatch([], form)
    const [twoFactorForm] = AntdForm.useForm<{ twoFactorCode: string }>()
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmittable, setIsSubmittable] = useState(false)
    const [isGettingAvatar, setIsGettingAvatar] = useState(false)
    const [avatar, setAvatar] = useState('')
    const [userWithPowerInfoVo, setUserWithPowerInfoVo] = useState<UserWithPowerInfoVo>()
    const [changePasswordForm] = AntdForm.useForm<ChangePasswordFields>()

    const handleOnReset = () => {
        getProfile()
    }

    const handleOnSave = () => {
        if (isSubmitting) {
            return
        }
        setIsSubmitting(true)
        void message.loading({ content: '保存中', key: 'LOADING', duration: 0 })

        void r_sys_user_info_update({ avatar, nickname: formValues.nickname })
            .then((res) => {
                const response = res.data
                switch (response.code) {
                    case DATABASE_UPDATE_SUCCESS:
                        void message.success('保存成功')
                        getProfile()
                        break
                    default:
                        void message.error('保存失败，请稍后重试')
                }
            })
            .finally(() => {
                setIsSubmitting(false)
                void message.destroy('LOADING')
            })
    }

    const handleOnChangeAvatar = () => {
        if (isLoading || isGettingAvatar) {
            return
        }
        setIsGettingAvatar(true)
        void r_api_avatar_random_base64()
            .then((res) => {
                const response = res.data
                if (response.success) {
                    response.data?.base64 && setAvatar(response.data.base64)
                }
            })
            .finally(() => {
                setIsGettingAvatar(false)
            })
    }

    const handleOnChangePassword = () => {
        changePasswordForm.resetFields()

        void modal.confirm({
            icon: <></>,
            title: (
                <>
                    <Icon
                        style={{ color: COLOR_PRODUCTION, marginRight: 10 }}
                        component={IconOxygenSetting}
                    />
                    修改密码
                </>
            ),
            centered: true,
            maskClosable: true,
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
                    ref={(ref) => {
                        setTimeout(() => {
                            ref?.getFieldInstance('originalPassword').focus()
                        }, 50)
                    }}
                >
                    <AntdForm.Item
                        name={'originalPassword'}
                        label={'原密码'}
                        labelAlign={'right'}
                        rules={[{ required: true, message: '请输入原密码' }]}
                    >
                        <AntdInput.Password placeholder={'请输入原密码'} />
                    </AntdForm.Item>
                    <AntdForm.Item
                        name={'newPassword'}
                        label={'新密码'}
                        labelAlign={'right'}
                        rules={[
                            { required: true, message: '请输入新密码' },
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
                            { required: true, message: '请确认密码' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve()
                                    }
                                    return Promise.reject(new Error('两次密码输入必须一致'))
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
                    () => {
                        return new Promise<void>((resolve, reject) => {
                            void r_sys_user_info_change_password({
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
                                        void message.success('密码修改成功，请重新登录')
                                        removeToken()
                                        notification.info({
                                            message: '已退出登录',
                                            icon: (
                                                <Icon
                                                    component={IconOxygenExit}
                                                    style={{ color: COLOR_ERROR }}
                                                />
                                            )
                                        })
                                        setTimeout(() => {
                                            window.location.reload()
                                        }, 1500)
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

    const handleOnChangeTwoFactor = (enable: boolean) => {
        return () => {
            twoFactorForm.resetFields()
            if (enable) {
                void modal.confirm({
                    title: '双因素',
                    centered: true,
                    maskClosable: true,
                    focusTriggerAfterClose: false,
                    footer: (_, { OkBtn, CancelBtn }) => (
                        <>
                            <OkBtn />
                            <CancelBtn />
                        </>
                    ),
                    content: '确定解除双因素？',
                    onOk: () => {
                        void modal.confirm({
                            title: '解除双因素',
                            centered: true,
                            maskClosable: true,
                            footer: (_, { OkBtn, CancelBtn }) => (
                                <>
                                    <OkBtn />
                                    <CancelBtn />
                                </>
                            ),
                            content: (
                                <>
                                    <AntdForm
                                        form={twoFactorForm}
                                        ref={(ref) => {
                                            setTimeout(() => {
                                                ref?.getFieldInstance('twoFactorCode').focus()
                                            }, 50)
                                        }}
                                    >
                                        <AntdForm.Item
                                            name={'twoFactorCode'}
                                            label={'验证码'}
                                            style={{ marginTop: 10 }}
                                            rules={[{ required: true, len: 6 }]}
                                        >
                                            <AntdInput
                                                showCount
                                                maxLength={6}
                                                autoComplete={'off'}
                                            />
                                        </AntdForm.Item>
                                    </AntdForm>
                                </>
                            ),
                            onOk: () =>
                                twoFactorForm.validateFields().then(
                                    () => {
                                        return new Promise<void>((resolve) => {
                                            void r_auth_two_factor_remove({
                                                code: twoFactorForm.getFieldValue(
                                                    'twoFactorCode'
                                                ) as string
                                            })
                                                .then((res) => {
                                                    const response = res.data
                                                    if (response.success) {
                                                        void message.success('解绑成功')
                                                        getProfile()
                                                    } else {
                                                        void message.error('解绑失败，请稍后重试')
                                                    }
                                                })
                                                .finally(() => {
                                                    resolve()
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
                })
            } else {
                if (isLoading) {
                    return
                }
                setIsLoading(true)
                void message.loading({ content: '加载中', key: 'LOADING', duration: 0 })
                void r_auth_two_factor_create()
                    .then((res) => {
                        message.destroy('LOADING')
                        const response = res.data
                        if (response.success) {
                            void modal.confirm({
                                title: '绑定双因素',
                                centered: true,
                                maskClosable: true,
                                footer: (_, { OkBtn, CancelBtn }) => (
                                    <>
                                        <OkBtn />
                                        <CancelBtn />
                                    </>
                                ),
                                content: (
                                    <>
                                        <AntdImage
                                            src={`data:image/svg+xml;base64,${response.data?.qrCodeSVGBase64}`}
                                            alt={'Two-factor'}
                                            preview={false}
                                        />
                                        <AntdTag style={{ whiteSpace: 'normal' }}>
                                            请使用身份验证器APP（eg. Microsoft Authenticator, Google
                                            Authenticator）扫描二维码，并在下方输入显示的动态二维码进行绑定
                                        </AntdTag>
                                        <AntdForm
                                            form={twoFactorForm}
                                            ref={(ref) => {
                                                setTimeout(() => {
                                                    ref?.getFieldInstance('twoFactorCode').focus()
                                                }, 50)
                                            }}
                                        >
                                            <AntdForm.Item
                                                name={'twoFactorCode'}
                                                label={'验证码'}
                                                style={{ marginTop: 10, marginRight: 30 }}
                                                rules={[{ required: true, len: 6 }]}
                                            >
                                                <AntdInput
                                                    showCount
                                                    maxLength={6}
                                                    autoComplete={'off'}
                                                />
                                            </AntdForm.Item>
                                        </AntdForm>
                                    </>
                                ),
                                onOk: () =>
                                    twoFactorForm.validateFields().then(
                                        () => {
                                            return new Promise<void>((resolve) => {
                                                void r_auth_two_factor_validate({
                                                    code: twoFactorForm.getFieldValue(
                                                        'twoFactorCode'
                                                    ) as string
                                                })
                                                    .then((res) => {
                                                        const response = res.data
                                                        if (response.success) {
                                                            void message.success('绑定成功')
                                                            getProfile()
                                                        } else {
                                                            void message.error(
                                                                '绑定失败，请稍后重试'
                                                            )
                                                        }
                                                    })
                                                    .finally(() => {
                                                        resolve()
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
    }

    const getProfile = () => {
        if (isLoading) {
            return
        }
        setIsLoading(true)

        void getUserInfo(true)
            .then((userWithPowerInfoVo) => {
                setAvatar(userWithPowerInfoVo.userInfo.avatar)
                form.setFieldValue('nickname', userWithPowerInfoVo.userInfo.nickname)
                setUserWithPowerInfoVo(userWithPowerInfoVo)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    useEffect(() => {
        form.validateFields({ validateOnly: true }).then(
            () => {
                setIsSubmittable(true)
            },
            () => {
                setIsSubmittable(false)
            }
        )
    }, [formValues])

    useEffect(() => {
        getProfile()
    }, [])

    return (
        <>
            <FitFullscreen data-component={'user'}>
                <HideScrollbar
                    isShowVerticalScrollbar
                    autoHideWaitingTime={1000}
                    className={'root-content'}
                >
                    <Card>
                        <FlexBox className={'info'} direction={'horizontal'}>
                            <AntdTooltip title={'点击获取新头像'}>
                                <div className={'avatar-box'}>
                                    <AntdAvatar
                                        src={
                                            <img
                                                src={`data:image/png;base64,${avatar}`}
                                                alt={'Avatar'}
                                            />
                                        }
                                        size={144}
                                        style={{
                                            background: COLOR_BACKGROUND,
                                            cursor: 'pointer'
                                        }}
                                        className={'avatar'}
                                        onClick={handleOnChangeAvatar}
                                    />
                                </div>
                            </AntdTooltip>
                            <FlexBox className={'info-name'}>
                                <div className={'nickname'}>
                                    {userWithPowerInfoVo?.userInfo.nickname}
                                </div>
                                <a
                                    className={'url'}
                                    href={
                                        userWithPowerInfoVo?.username &&
                                        new URL(
                                            `/store/${userWithPowerInfoVo.username}`,
                                            location.href
                                        ).href
                                    }
                                >
                                    {userWithPowerInfoVo?.username &&
                                        new URL(
                                            `/store/${userWithPowerInfoVo.username}`,
                                            location.href
                                        ).href}
                                    <Icon component={IconOxygenShare} />
                                </a>
                            </FlexBox>
                        </FlexBox>
                        <FlexBox className={'title'}>
                            <FlexBox direction={'horizontal'} className={'content'}>
                                <div className={'text'}>档案管理</div>
                                <FlexBox className={'operation'} direction={'horizontal'}>
                                    <AntdButton onClick={handleOnReset} loading={isLoading}>
                                        重置
                                    </AntdButton>
                                    <AntdButton
                                        onClick={handleOnSave}
                                        type={'primary'}
                                        disabled={isLoading || !isSubmittable}
                                    >
                                        保存
                                    </AntdButton>
                                </FlexBox>
                            </FlexBox>
                        </FlexBox>
                        <div className={'divide'} />
                        <FlexBox className={'profile table'}>
                            <FlexBox className={'row'} direction={'horizontal'}>
                                <div className={'label'}>昵称</div>
                                <div className={'input'}>
                                    <AntdForm form={form}>
                                        <AntdForm.Item
                                            name={'nickname'}
                                            rules={[
                                                { required: true, message: '请输入昵称' },
                                                { min: 3, message: '昵称至少为3个字符' }
                                            ]}
                                            style={{ marginBottom: 0 }}
                                        >
                                            <AntdInput
                                                maxLength={20}
                                                showCount
                                                disabled={isLoading}
                                            />
                                        </AntdForm.Item>
                                    </AntdForm>
                                </div>
                            </FlexBox>
                            <FlexBox className={'row'} direction={'horizontal'}>
                                <div className={'label'}>用户名</div>
                                <div className={'input'}>
                                    <AntdInput disabled value={userWithPowerInfoVo?.username} />
                                </div>
                            </FlexBox>
                            <FlexBox className={'row'} direction={'horizontal'}>
                                <div className={'label'}>邮箱</div>
                                <div className={'input'}>
                                    <AntdInput
                                        disabled
                                        value={userWithPowerInfoVo?.userInfo.email}
                                    />
                                </div>
                            </FlexBox>
                            <FlexBox className={'row'} direction={'horizontal'}>
                                <div className={'label'}>注册时间</div>
                                <div className={'input'}>
                                    <AntdInput
                                        disabled
                                        value={utcToLocalTime(
                                            userWithPowerInfoVo?.createTime ?? ''
                                        )}
                                    />
                                </div>
                            </FlexBox>
                        </FlexBox>
                        <div className={'divide'} />
                        <FlexBox className={'security table'}>
                            <FlexBox className={'row'} direction={'horizontal'}>
                                <div className={'label'}>上次登录 IP</div>
                                <div className={'input'}>
                                    <AntdInput disabled value={userWithPowerInfoVo?.lastLoginIp} />
                                </div>
                            </FlexBox>
                            <FlexBox className={'row'} direction={'horizontal'}>
                                <div className={'label'}>上次登录时间</div>
                                <div className={'input'}>
                                    <AntdInput
                                        disabled
                                        value={utcToLocalTime(
                                            userWithPowerInfoVo?.lastLoginTime ?? ''
                                        )}
                                    />
                                </div>
                            </FlexBox>
                            <FlexBox className={'row'} direction={'horizontal'}>
                                <div className={'label'}>密码</div>
                                <div className={'input'}>
                                    <AntdSpace.Compact>
                                        <AntdInput disabled value={'********'} />
                                        <AntdButton
                                            type={'primary'}
                                            title={'更改密码'}
                                            disabled={isLoading}
                                            onClick={handleOnChangePassword}
                                        >
                                            <Icon component={IconOxygenRefresh} />
                                        </AntdButton>
                                    </AntdSpace.Compact>
                                </div>
                            </FlexBox>
                            <FlexBox className={'row'} direction={'horizontal'}>
                                <div className={'label'}>双因素</div>
                                <div className={'input'}>
                                    <AntdSpace.Compact>
                                        <AntdInput
                                            disabled
                                            style={{
                                                color: userWithPowerInfoVo?.twoFactor
                                                    ? COLOR_PRODUCTION
                                                    : undefined
                                            }}
                                            value={
                                                userWithPowerInfoVo?.twoFactor ? '已设置' : '未设置'
                                            }
                                        />
                                        <AntdButton
                                            type={'primary'}
                                            title={userWithPowerInfoVo?.twoFactor ? '解绑' : '绑定'}
                                            disabled={isLoading}
                                            onClick={handleOnChangeTwoFactor(
                                                userWithPowerInfoVo?.twoFactor ?? false
                                            )}
                                        >
                                            <Icon
                                                component={
                                                    userWithPowerInfoVo?.twoFactor
                                                        ? IconOxygenUnlock
                                                        : IconOxygenLock
                                                }
                                            />
                                        </AntdButton>
                                    </AntdSpace.Compact>
                                </div>
                            </FlexBox>
                        </FlexBox>
                    </Card>
                </HideScrollbar>
            </FitFullscreen>
            {contextHolder}
        </>
    )
}

export default User
