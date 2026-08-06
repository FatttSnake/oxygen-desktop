export const IpcEvents = {
    app: {
        url: {
            open: 'app:url:open'
        },
        version: {
            get: 'app:version:get'
        },
        config: {
            get: 'app:config:get',
            update: 'app:config:update',
            reload: 'app:config:reload'
        }
    },
    window: {
        base: {
            close: 'window:base:close',
            afterLoad: 'window:base:afterLoad',
            icon: 'window:base:icon',
            title: 'window:base:title'
        },
        theme: {
            get: 'window:theme:get',
            update: 'window:theme:update'
        },
        titleBarOverlay: {
            setColor: 'window:titleBarOverlay:setColor'
        },
        tab: {
            create: 'window:tab:create',
            list: 'window:tab:list',
            update: 'window:tab:update',
            switch: 'window:tab:switch',
            close: 'window:tab:close',
            closed: 'window:tab:closed',
            independent: 'window:tab:independent',
            icon: 'window:tab:icon',
            title: 'window:tab:title'
        },
        navigate: {
            goto: 'window:navigate:goto'
        }
    },
    sidebar: {
        width: {
            update: 'sidebar:width:update'
        },
        collapse: {
            get: 'sidebar:collapse:get',
            update: 'sidebar:collapse:update'
        },
        menu: {
            update: 'sidebar:menu:update'
        }
    },
    account: {
        loginAccount: {
            get: 'account:loginAccount:get',
            update: 'account:loginAccount:update'
        },
        accessToken: {
            get: 'account:accessToken:get',
            update: 'account:accessToken:update'
        },
        refreshToken: {
            get: 'account:refreshToken:get',
            update: 'account:refreshToken:update'
        },
        csrfToken: {
            get: 'account:csrfToken:get',
            update: 'account:csrfToken:update'
        },
        userInfo: {
            get: 'account:userInfo:get',
            update: 'account:userInfo:update'
        },
        loginStatus: {
            update: 'account:loginStatus:update'
        }
    },
    tool: {
        view: {
            load: 'tool:view:load',
            render: 'tool:view:render',
            devtools: 'tool:view:devtools'
        }
    }
}

export const WindowConstants = {
    WINDOW_MIN_WIDTH: 600,
    WINDOW_MIN_HEIGHT: 400,
    APPLICATION_NAME: 'Oxygen Toolbox',
    TITLE_BAR_HEIGHT: 40
}
