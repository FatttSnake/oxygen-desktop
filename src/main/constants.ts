export const IpcEvents = {
    app: {
        url: {
            open: 'app:url:open'
        },
        version: {
            get: 'app:version:get'
        }
    },
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
        width: {
            update: 'sidebar:width:update'
        },
        collapse: {
            get: 'sidebar:collapse:get',
            update: 'sidebar:collapse:update'
        }
    },
    mainView: {
        url: {
            open: 'mainView:url:open'
        }
    }
}
