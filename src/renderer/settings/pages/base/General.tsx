import Icon from '@ant-design/icons'
import SettingsControl from '%/components/SettingsControl'

const General = () => {
    const [appVersion, setAppVersion] = useState('Unknown')
    const [theme, setTheme] = useState<WindowTheme>('FOLLOW_SYSTEM')

    const handleOnChangeTheme = (value: WindowTheme) => {
        oxygenApi.window.theme.update(value)
    }

    useEffect(() => {
        oxygenApi.app.version.get().then((appVersion) => {
            setAppVersion(`v${appVersion}`)
        })
        oxygenApi.window.theme.get().then((theme) => {
            setTheme(theme)
        })
        oxygenApi.window.theme.onUpdate((theme) => {
            setTheme(theme)
        })
    }, [])

    return (
        <SettingsControl header={'常规'}>
            <SettingsControl.Group title={'外观'}>
                <SettingsControl.Item icon={IconOxygenLanguage} name={'语言'} desc={'界面语言'}>
                    <AntdSelect value={'zh_CN'}>
                        <AntdSelect.Option value={'zh_CN'}>中文</AntdSelect.Option>
                    </AntdSelect>
                </SettingsControl.Item>
                <SettingsControl.Item icon={IconOxygenColor} name={'主题'} desc={'主题颜色'}>
                    <AntdSegmented<WindowTheme>
                        options={[
                            {
                                icon: <Icon component={IconOxygenThemeSystem} />,
                                title: '跟随系统',
                                value: 'FOLLOW_SYSTEM'
                            },
                            {
                                label: <Icon component={IconOxygenThemeLight} />,
                                title: '亮色',
                                value: 'LIGHT'
                            },
                            {
                                label: <Icon component={IconOxygenThemeDark} />,
                                title: '深色',
                                value: 'DARK'
                            }
                        ]}
                        value={theme}
                        onChange={handleOnChangeTheme}
                        block
                    />
                </SettingsControl.Item>
            </SettingsControl.Group>
            <SettingsControl.Group title={'关于'}>
                <SettingsControl.Item icon={IconOxygenLogo} name={'版本'} desc={'应用版本名称'}>
                    {appVersion}
                </SettingsControl.Item>
                <SettingsControl.Item
                    icon={IconOxygenCode}
                    name={'项目'}
                    desc={'本应用为开源项目'}
                    onClick={() =>
                        oxygenApi.app.url.open('https://github.com/FatttSnake/oxygen-desktop')
                    }
                >
                    <Icon component={IconOxygenOpen} />
                </SettingsControl.Item>
                <SettingsControl.Item
                    icon={IconOxygenOpenSource}
                    name={'开源协议'}
                    desc={'本项目遵循 GPL-3.0 开源协议'}
                    onClick={() =>
                        oxygenApi.app.url.open(
                            'https://github.com/FatttSnake/oxygen-desktop/blob/master/LICENSE'
                        )
                    }
                >
                    <Icon component={IconOxygenOpen} />
                </SettingsControl.Item>
                <SettingsControl.Item
                    icon={IconOxygenIssue}
                    name={'工单'}
                    desc={'反馈遇到的问题或提出建议'}
                    onClick={() =>
                        oxygenApi.app.url.open(
                            'https://github.com/FatttSnake/oxygen-desktop/issues'
                        )
                    }
                >
                    <Icon component={IconOxygenOpen} />
                </SettingsControl.Item>
            </SettingsControl.Group>
        </SettingsControl>
    )
}

export default General
