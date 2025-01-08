export const IpcEvents = {
    window: {
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
