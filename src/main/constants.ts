export const IpcEvents = {
    window: {
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
            independent: 'window:tab:independent'
        }
    },
    sidebar: {
        collapse: {
            get: 'sidebar:collapse:get',
            update: 'sidebar:collapse:update'
        }
    },
    menuView: {
        width: {
            update: 'menuView:width:update'
        }
    },
    mainView: {
        url: {
            open: 'mainView:url:open'
        }
    }
}
