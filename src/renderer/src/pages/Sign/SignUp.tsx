import Icon from '@ant-design/icons'
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile'
import {
    DATABASE_DUPLICATE_KEY,
    H_CAPTCHA_SITE_KEY,
    PERMISSION_REGISTER_SUCCESS,
    SYSTEM_INVALID_CAPTCHA_CODE,
    SYSTEM_MATCH_SENSITIVE_WORD
} from '@/constants/common.constants'
import { getLoginStatus, setToken } from '@/util/auth'
import { navigateToLogin } from '@/util/navigation'
import { r_auth_register, r_auth_resend } from '@/services/auth'
import FitCenter from '@/components/common/FitCenter'
import FlexBox from '@/components/common/FlexBox'

const SignUp = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const turnstileRef = useRef<TurnstileInstance>()
    const [refreshTime, setRefreshTime] = useState(0)
    const [isSigningUp, setIsSigningUp] = useState(false)
    const [isFinish, setIsFinish] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [captchaCode, setCaptchaCode] = useState('')

    useEffect(() => {
        const timer = setInterval(() => {
            if (window.turnstile) {
                clearInterval(timer)
                setRefreshTime(Date.now())
                if (location.pathname === '/register') {
                    setTimeout(() => {
                        turnstileRef.current?.execute()
                    }, 500)
                }
            }
        })
    }, [location.pathname])

    useEffect(() => {
        if (!isSigningUp) {
            setCaptchaCode('')
            turnstileRef.current?.reset()
            turnstileRef.current?.execute()
        }
    }, [isSigningUp])

    useEffect(() => {
        if (location.pathname !== '/register') {
            return
        }
        if (getLoginStatus()) {
            navigateToLogin(navigate, location.search, undefined, { replace: true })
        }
    }, [location.pathname])

    const handleOnFinish = (registerParam: RegisterParam) => {
        if (isSigningUp) {
            return
        }
        setIsSigningUp(true)

        if (!captchaCode) {
            void message.warning('请先通过验证')
            setIsSigningUp(false)
            return
        }

        void r_auth_register({
            username: registerParam.username,
            email: registerParam.email,
            password: registerParam.password,
            captchaCode
        })
            .then((res) => {
                const response = res.data
                switch (response.code) {
                    case PERMISSION_REGISTER_SUCCESS:
                        setToken(response.data?.token ?? '')
                        void message.success('恭喜，您快要完成注册了')
                        setIsFinish(true)
                        break
                    case DATABASE_DUPLICATE_KEY:
                        void message.error('用户名或邮箱已被注册，请重试')
                        setIsSigningUp(false)
                        break
                    case SYSTEM_INVALID_CAPTCHA_CODE:
                        void message.error('验证码有误，请重试')
                        setIsSigningUp(false)
                        break
                    case SYSTEM_MATCH_SENSITIVE_WORD:
                        void message.error('用户名包含敏感词，请重试')
                        setIsSigningUp(false)
                        break
                    default:
                        void message.error('服务器出错了，请稍后重试')
                        setIsSigningUp(false)
                }
            })
            .catch(() => {
                setIsSigningUp(false)
            })
    }

    const handleOnResend = () => {
        if (isSending) {
            return
        }
        setIsSending(true)
        void message.loading({ content: '发送中', key: 'SENDING', duration: 0 })
        void r_auth_resend()
            .then((res) => {
                const response = res.data
                if (response.success) {
                    void message.success('已发送验证邮件，请查收')
                } else {
                    void message.error('出错了，请稍后重试')
                }
            })
            .finally(() => {
                message.destroy('SENDING')
                setIsSending(false)
            })
    }

    return (
        <div className={'sign-up'}>
            <FitCenter>
                <FlexBox>
                    <div className={'title'}>
                        <div className={'primary'}>创建账号</div>
                        <div className={'secondary'}>Create account</div>
                    </div>
                    <AntdForm autoComplete={'on'} onFinish={handleOnFinish} className={'form'}>
                        {!isFinish ? (
                            <>
                                <AntdForm.Item
                                    name={'username'}
                                    rules={[
                                        { required: true, message: '请输入用户名' },
                                        { whitespace: true, message: '用户名不能为空字符' },
                                        {
                                            pattern: /^[a-zA-Z-_][0-9a-zA-Z-_]{2,38}$/,
                                            message:
                                                '只能包含字母、数字、连字符和下划线，不能以数字开头'
                                        }
                                    ]}
                                >
                                    <AntdInput
                                        prefix={<Icon component={IconOxygenUser} />}
                                        maxLength={39}
                                        showCount={true}
                                        disabled={isSigningUp}
                                        placeholder={'用户名'}
                                    />
                                </AntdForm.Item>
                                <AntdForm.Item
                                    name={'email'}
                                    rules={[
                                        { required: true, message: '请输入邮箱' },
                                        { type: 'email', message: '不是有效的邮箱地址' }
                                    ]}
                                >
                                    <AntdInput
                                        type={'email'}
                                        prefix={<Icon component={IconOxygenEmail} />}
                                        disabled={isSigningUp}
                                        placeholder={'邮箱'}
                                    />
                                </AntdForm.Item>
                                <AntdForm.Item
                                    name={'password'}
                                    rules={[
                                        { required: true, message: '请输入密码' },
                                        { whitespace: true, message: '密码不能为空字符' },
                                        { min: 10, message: '密码至少为10位' },
                                        { max: 30, message: '密码最多为30位' }
                                    ]}
                                >
                                    <AntdInput.Password
                                        id={'sign-up-password'}
                                        prefix={<Icon component={IconOxygenPassword} />}
                                        disabled={isSigningUp}
                                        placeholder={'密码'}
                                    />
                                </AntdForm.Item>
                                <AntdForm.Item
                                    name={'passwordConfirm'}
                                    rules={[
                                        { required: true, message: '请确认密码' },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('password') === value) {
                                                    return Promise.resolve()
                                                }
                                                return Promise.reject(
                                                    new Error('两次密码输入必须一致')
                                                )
                                            }
                                        })
                                    ]}
                                >
                                    <AntdInput.Password
                                        id={'sign-up-password-confirm'}
                                        prefix={<Icon component={IconOxygenPassword} />}
                                        disabled={isSigningUp}
                                        placeholder={'确认密码'}
                                    />
                                </AntdForm.Item>
                                <AntdForm.Item>
                                    <Turnstile
                                        id={'sign-up-turnstile'}
                                        ref={turnstileRef}
                                        siteKey={H_CAPTCHA_SITE_KEY}
                                        options={{
                                            theme: 'light',
                                            execution: 'execute',
                                            appearance: 'execute'
                                        }}
                                        onSuccess={setCaptchaCode}
                                        data-refresh={refreshTime}
                                    />
                                </AntdForm.Item>
                                <AntdForm.Item>
                                    <AntdButton
                                        style={{ width: '100%' }}
                                        type={'primary'}
                                        htmlType={'submit'}
                                        disabled={isSigningUp}
                                        loading={isSigningUp}
                                    >
                                        注&ensp;&ensp;&ensp;&ensp;册
                                    </AntdButton>
                                </AntdForm.Item>
                            </>
                        ) : (
                            <div className={'retry'}>
                                我们发送了一封包含验证账号链接的邮件到您的邮箱里，如未收到，可能被归为垃圾邮件，请仔细检查。
                                <a onClick={handleOnResend}>重新发送</a>
                            </div>
                        )}

                        <div className={'footer'} hidden={isFinish}>
                            已有账号？
                            <a
                                onClick={() =>
                                    navigateToLogin(navigate, location.search, undefined, {
                                        replace: true
                                    })
                                }
                            >
                                登录
                            </a>
                        </div>
                    </AntdForm>
                </FlexBox>
            </FitCenter>
        </div>
    )
}

export default SignUp
