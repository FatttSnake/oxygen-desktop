import Icon from '@ant-design/icons'
import useStyles from '+/assets/css/sign-in.style'
import {
    PERMISSION_LOGIN_SUCCESS,
    PERMISSION_LOGIN_USERNAME_PASSWORD_ERROR,
    PERMISSION_NEED_TWO_FACTOR,
    PERMISSION_TWO_FACTOR_VERIFICATION_CODE_ERROR,
    PERMISSION_USER_DISABLE,
    PERMISSION_USERNAME_NOT_FOUND,
    SYSTEM_INVALID_CAPTCHA_CODE
} from '$/constants/common.constants'
import { useConfigValue } from '$/components/config/ConfigContext'
import { message, modal } from '$/util/common'
import { utcToLocalTime } from '$/util/datetime'
import { getUserInfo, setAccessToken, setCsrfToken, setRefreshToken } from '$/util/auth'
import { navigateToForget, navigateToRegister } from '$/util/navigation'
import { r_auth_login } from '$/services/auth'
import { CommonContext } from '$/CommonFramework'
import FitCenter from '$/components/FitCenter'
import FlexBox from '$/components/FlexBox'
import Captcha, { CaptchaElement } from '$/components/Captcha'

const SignIn = () => {
    const { styles, theme } = useStyles()
    const { isDarkMode } = useContext(CommonContext)
    const navigate = useNavigate()
    const [loginForm] = AntdForm.useForm<LoginParam>()
    const [twoFactorForm] = AntdForm.useForm<{ twoFactorCode: string }>()
    const captchaRef = useRef<CaptchaElement>(null)
    const [isSigningIn, setIsSigningIn] = useState(false)
    const [captchaCode, setCaptchaCode] = useState('')
    const turnstileSiteKey = useConfigValue('turnstileSiteKey')

    useEffect(() => {
        if (!isSigningIn) {
            setCaptchaCode('')
            captchaRef.current?.refresh()
        }
    }, [isSigningIn])

    const handleOnFinish = (loginParam: LoginParam) => {
        if (isSigningIn) {
            return
        }
        setIsSigningIn(true)

        if (turnstileSiteKey && !captchaCode) {
            void message.warning('请先通过验证')
            setIsSigningIn(false)
            return
        }

        r_auth_login({
            account: loginParam.account,
            password: loginParam.password,
            captchaCode,
            twoFactorCode: loginParam.twoFactorCode
        })
            .then((res) => {
                const response = res.data
                const { code, data } = response
                switch (code) {
                    case PERMISSION_LOGIN_SUCCESS:
                        oxygenApi.account.loginAccount.update(loginParam.account)
                        setRefreshToken(data!.refreshToken)
                        setAccessToken(data!.accessToken)
                        setCsrfToken(data!.csrfToken)
                        getUserInfo().then((user) => {
                            new Notification(`欢迎回来，${user.userInfo.nickname}`, {
                                icon: `data:image/png;base64,${user.userInfo.avatar}`,
                                body: `最近登录：${
                                    user.lastLoginTime
                                        ? `${utcToLocalTime(user.lastLoginTime)}【${
                                              user.lastLoginIp
                                          }】`
                                        : '无'
                                }`
                            })
                            message.success('登录成功', 1).then(() => {
                                void oxygenApi.window.tab.switch('coreView')
                                oxygenApi.window.tab.close('signView')
                                oxygenApi.account.loginStatus.update(true)
                            })
                        })
                        break
                    case PERMISSION_NEED_TWO_FACTOR:
                        twoFactorForm.resetFields()
                        void modal.confirm({
                            centered: true,
                            icon: (
                                <Icon
                                    style={{ color: theme.colorPrimary }}
                                    component={IconOxygen2fa}
                                />
                            ),
                            title: '双因素验证',
                            content: (
                                <AntdForm
                                    form={twoFactorForm}
                                    ref={() => {
                                        setTimeout(() => {
                                            twoFactorForm.getFieldInstance('twoFactorCode')?.focus()
                                        }, 50)
                                    }}
                                >
                                    <AntdForm.Item
                                        name={'twoFactorCode'}
                                        label={'验证码'}
                                        style={{ marginTop: 10 }}
                                        rules={[{ required: true, whitespace: true, len: 6 }]}
                                    >
                                        <AntdInput showCount maxLength={6} autoComplete={'off'} />
                                    </AntdForm.Item>
                                </AntdForm>
                            ),
                            onOk: () =>
                                twoFactorForm.validateFields().then(
                                    () => {
                                        return new Promise<void>((resolve) => {
                                            handleOnFinish({
                                                ...loginParam,
                                                twoFactorCode: twoFactorForm.getFieldValue(
                                                    'twoFactorCode'
                                                ) as string
                                            })
                                            resolve()
                                        })
                                    },
                                    () => {
                                        return new Promise((_, reject) => {
                                            reject('输入有误')
                                        })
                                    }
                                ),
                            onCancel: () => {
                                setIsSigningIn(false)
                            }
                        })
                        break
                    case PERMISSION_USERNAME_NOT_FOUND:
                    case PERMISSION_LOGIN_USERNAME_PASSWORD_ERROR:
                        void message.error(
                            <>
                                <strong>账号</strong>或<strong>密码</strong>错误，请重试
                            </>
                        )
                        setIsSigningIn(false)
                        break
                    case PERMISSION_TWO_FACTOR_VERIFICATION_CODE_ERROR:
                        void message.error('双因素验证码错误')
                        setIsSigningIn(false)
                        break
                    case PERMISSION_USER_DISABLE:
                        void message.error(
                            <>
                                该用户已被<strong>禁用</strong>
                            </>
                        )
                        setIsSigningIn(false)
                        break
                    case SYSTEM_INVALID_CAPTCHA_CODE:
                        void message.error('验证码有误，请重试')
                        setIsSigningIn(false)
                        break
                    default:
                        void message.error(<strong>服务器出错了</strong>)
                        setIsSigningIn(false)
                }
            })
            .catch(() => {
                setIsSigningIn(false)
            })
    }

    return (
        <FitCenter>
            <FlexBox>
                <div className={styles.title}>
                    <div className={styles.primary}>欢迎回来</div>
                    <div className={styles.secondary}>Welcome back</div>
                </div>
                <AntdForm
                    form={loginForm}
                    autoComplete={'on'}
                    onFinish={handleOnFinish}
                    className={styles.form}
                >
                    <AntdForm.Item
                        name={'account'}
                        rules={[
                            { required: true, message: '请输入账号' },
                            { whitespace: true, message: '账号不能为空字符' }
                        ]}
                    >
                        <AntdInput
                            prefix={<Icon component={IconOxygenUser} />}
                            disabled={isSigningIn}
                            placeholder={'邮箱/用户名'}
                        />
                    </AntdForm.Item>
                    <AntdForm.Item
                        name={'password'}
                        rules={[
                            { required: true, message: '请输入密码' },
                            { whitespace: true, message: '密码不能为空字符' }
                        ]}
                    >
                        <AntdInput.Password
                            prefix={<Icon component={IconOxygenPassword} />}
                            disabled={isSigningIn}
                            placeholder={'密码'}
                        />
                    </AntdForm.Item>
                    {location.pathname === '/login' && turnstileSiteKey && (
                        <AntdForm.Item>
                            <Captcha
                                ref={captchaRef}
                                turnstileSiteKey={turnstileSiteKey}
                                isDarkMode={isDarkMode}
                                action={'login'}
                                onSuccess={setCaptchaCode}
                            />
                        </AntdForm.Item>
                    )}
                    <FlexBox direction={'horizontal'} className={styles.addition}>
                        <a />
                        <a
                            onClick={() => {
                                navigateToForget(navigate, location.search, { replace: true })
                            }}
                        >
                            忘记密码？
                        </a>
                    </FlexBox>
                    <AntdForm.Item>
                        <AntdButton
                            style={{ width: '100%' }}
                            type={'primary'}
                            htmlType={'submit'}
                            disabled={isSigningIn}
                            loading={isSigningIn}
                        >
                            登&ensp;&ensp;&ensp;&ensp;录
                        </AntdButton>
                    </AntdForm.Item>
                    <div className={styles.footer}>
                        还没有账号？
                        <a
                            onClick={() =>
                                navigateToRegister(navigate, location.search, { replace: true })
                            }
                        >
                            注册
                        </a>
                    </div>
                </AntdForm>
            </FlexBox>
        </FitCenter>
    )
}

export default SignIn
