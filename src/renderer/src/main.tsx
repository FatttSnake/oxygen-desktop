import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import zh_CN from 'antd/locale/zh_CN'
import '@/assets/css/base.scss'
import '@/assets/css/common.scss'
import { COLOR_MAIN } from '@/constants/common.constants'
import App from './App'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AntdConfigProvider
            theme={{
                token: {
                    colorPrimary: COLOR_MAIN,
                    colorLinkHover: COLOR_MAIN
                },
                components: {
                    Tree: {
                        colorBgContainer: 'transparent'
                    }
                }
            }}
            locale={zh_CN}
        >
            <App />
        </AntdConfigProvider>
    </StrictMode>
)
