import Icon from '@ant-design/icons'
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile'
import {
    H_CAPTCHA_SITE_KEY,
    PERMISSION_FORGET_SUCCESS,
    PERMISSION_RETRIEVE_CODE_ERROR_OR_EXPIRED,
    PERMISSION_RETRIEVE_SUCCESS,
    PERMISSION_USER_NOT_FOUND,
    SYSTEM_INVALID_CAPTCHA_CODE
} from '@/constants/common.constants'
import { r_auth_forget, r_auth_retrieve } from '@/services/auth'
import FitCenter from '@/components/common/FitCenter'
import FlexBox from '@/components/common/FlexBox'

const Forget = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const turnstileRef = useRef<TurnstileInstance>()
    const retrieveTurnstileRef = useRef<TurnstileInstance>()
    const [refreshTime, setRefreshTime] = useState(0)
    const [isSending, setIsSending] = useState(false)
    const [isSent, setIsSent] = useState(false)
    const [isChanging, setIsChanging] = useState(false)
    const [isChanged, setIsChanged] = useState(false)
    const [captchaCode, setCaptchaCode] = useState('')
    const [retrieveCaptchaCode, setRetrieveCaptchaCode] = useState('')

    useEffect(() => {
        const timer = setInterval(() => {
            if (window.turnstile) {
                clearInterval(timer)
                setRefreshTime(Date.now())
                if (location.pathname === '/forget' && !searchParams.get('code')) {
                    setTimeout(() => {
                        turnstileRef.current?.execute()
                    }, 500)
                }
                if (location.pathname === '/forget' && searchParams.get('code')) {
                    setTimeout(() => {
                        retrieveTurnstileRef.current?.execute()
                    }, 500)
                }
            }
        })
    }, [location.pathname])

    useEffect(() => {
        if (!isSending) {
            setCaptchaCode('')
            turnstileRef.current?.reset()
            turnstileRef.current?.execute()
        }
    }, [isSending])

    useEffect(() => {
        if (!isChanging) {
            setRetrieveCaptchaCode('')
            retrieveTurnstileRef.current?.reset()
            retrieveTurnstileRef.current?.execute()
        }
    }, [isChanging])

    const handleOnSend = (forgetParam: ForgetParam) => {
        if (isSending) {
            return
        }
        setIsSending(true)

        if (!captchaCode) {
            void message.warning('请先通过验证')
            setIsSending(false)
            return
        }

        void r_auth_forget({ email: forgetParam.email, captchaCode })
            .then((res) => {
                const response = res.data
                switch (response.code) {
                    case PERMISSION_FORGET_SUCCESS:
                        void message.success('已发送验证邮件，请查收')
                        setIsSent(true)
                        break
                    case PERMISSION_USER_NOT_FOUND:
                        void message.error('用户不存在')
                        break
                    case SYSTEM_INVALID_CAPTCHA_CODE:
                        void message.error('验证码有误，请重试')
                        break
                    default:
                        void message.error('出错了，请稍后重试')
                }
            })
            .finally(() => {
                setIsSending(false)
            })
    }

    const handleOnRetry = () => {
        setIsSent(false)
    }

    const handleOnChange = (retrieveParam: RetrieveParam) => {
        if (isChanging) {
            return
        }
        setIsChanging(true)

        void r_auth_retrieve({
            code: searchParams.get('code') ?? '',
            password: retrieveParam.password,
            captchaCode: retrieveCaptchaCode
        })
            .then((res) => {
                const response = res.data

                switch (response.code) {
                    case PERMISSION_RETRIEVE_SUCCESS:
                        void message.success('密码已更新')
                        setIsChanged(true)
                        break
                    case PERMISSION_RETRIEVE_CODE_ERROR_OR_EXPIRED:
                        void message.error('请重新获取邮件')
                        break
                    case SYSTEM_INVALID_CAPTCHA_CODE:
                        void message.error('验证码有误，请重试')
                        break
                    default:
                        void message.error('出错了，请稍后重试')
                }
            })
            .finally(() => {
                setIsChanging(false)
            })
    }

    return (
        <div className={'forget'}>
            <FitCenter>
                <FlexBox>
                    <div className={'title'}>
                        <div className={'primary'}>找回密码</div>
                        <div className={'secondary'}>Retrieve password</div>
                    </div>
                    <div className={'form'}>
                        {!searchParams.get('code') ? (
                            !isSent ? (
                                <>
                                    <AntdForm autoComplete={'on'} onFinish={handleOnSend}>
                                        <AntdForm.Item
                                            name={'email'}
                                            rules={[
                                                { required: true, message: '请输入邮箱' },
                                                { type: 'email', message: '不是有效的邮箱地址' }
                                            ]}
                                        >
                                            <AntdInput
                                                prefix={<Icon component={IconOxygenEmail} />}
                                                placeholder={'邮箱'}
                                                disabled={isSending}
                                            />
                                        </AntdForm.Item>
                                        <AntdForm.Item>
                                            <Turnstile
                                                id={'forget-turnstile'}
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
                                                disabled={isSending}
                                                loading={isSending}
                                            >
                                                确&ensp;&ensp;&ensp;&ensp;定
                                            </AntdButton>
                                        </AntdForm.Item>
                                    </AntdForm>
                                </>
                            ) : (
                                <div className={'retry'}>
                                    我们向您发送了一封包含找回密码链接的邮件，如未收到，可能被归为垃圾邮件，请仔细检查。
                                    <a onClick={handleOnRetry}>重新发送</a>
                                </div>
                            )
                        ) : !isChanged ? (
                            <>
                                <AntdForm autoComplete={'on'} onFinish={handleOnChange}>
                                    <AntdForm.Item
                                        name={'password'}
                                        rules={[
                                            { required: true, message: '请输入密码' },
                                            { min: 10, message: '密码至少为10位' },
                                            { max: 30, message: '密码最多为30位' }
                                        ]}
                                    >
                                        <AntdInput.Password
                                            id={'forget-password'}
                                            addonBefore={
                                                <span>新&nbsp;&nbsp;密&nbsp;&nbsp;码</span>
                                            }
                                            placeholder={'密码'}
                                            disabled={isChanging}
                                        />
                                    </AntdForm.Item>
                                    <AntdForm.Item
                                        name={'passwordConfirm'}
                                        rules={[
                                            { required: true, message: '请确认密码' },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    if (
                                                        !value ||
                                                        getFieldValue('password') === value
                                                    ) {
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
                                            id={'forget-password-confirm'}
                                            addonBefore={'确认密码'}
                                            placeholder={'确认密码'}
                                            disabled={isChanging}
                                        />
                                    </AntdForm.Item>
                                    <AntdForm.Item>
                                        <Turnstile
                                            id={'retrieve-turnstile'}
                                            ref={retrieveTurnstileRef}
                                            siteKey={H_CAPTCHA_SITE_KEY}
                                            options={{
                                                theme: 'light',
                                                execution: 'execute',
                                                appearance: 'execute'
                                            }}
                                            onSuccess={setRetrieveCaptchaCode}
                                            data-refresh={refreshTime}
                                        />
                                    </AntdForm.Item>
                                    <AntdForm.Item>
                                        <AntdButton
                                            style={{ width: '100%' }}
                                            type={'primary'}
                                            htmlType={'submit'}
                                            disabled={isChanging}
                                            loading={isChanging}
                                        >
                                            更&ensp;&ensp;&ensp;&ensp;改
                                        </AntdButton>
                                    </AntdForm.Item>
                                </AntdForm>
                            </>
                        ) : (
                            <div className={'success'}>恭喜你，密码已更新，请重新登录。</div>
                        )}

                        <div className={'footer'}>
                            找到了？
                            <a onClick={() => navigate(`/login`, { replace: true })}>登录</a>
                        </div>
                    </div>
                </FlexBox>
            </FitCenter>
        </div>
    )
}

export default Forget
