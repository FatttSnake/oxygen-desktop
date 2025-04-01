export type DeviceName =
    | 'iPhone SE'
    | 'iPhone XR'
    | 'iPhone 12 Pro'
    | 'iPhone 14 Pro Max'
    | 'Pixel 7'
    | 'Samsung Galaxy S8+'
    | 'Samsung Galaxy S20 Ultra'
    | 'iPad Mini'
    | 'iPad Air'
    | 'iPad Pro'
    | 'Surface Pro 7'
    | 'Surface Duo'
    | 'Galaxy Fold'
    | 'Asus Zenbook Fold'
    | 'Samsung Galaxy A51/71'
    | 'Nest Hub'
    | 'Nest Hub Max'

export interface IDevice {
    name: DeviceName
    width: number
    height: number
}

const devices: Record<DeviceName, IDevice> = {
    'iPhone SE': {
        name: 'iPhone SE',
        width: 375,
        height: 667
    },
    'iPhone XR': {
        name: 'iPhone XR',
        width: 414,
        height: 896
    },
    'iPhone 12 Pro': {
        name: 'iPhone 12 Pro',
        width: 390,
        height: 844
    },
    'iPhone 14 Pro Max': {
        name: 'iPhone 14 Pro Max',
        width: 430,
        height: 932
    },
    'Pixel 7': {
        name: 'Pixel 7',
        width: 412,
        height: 915
    },
    'Samsung Galaxy S8+': {
        name: 'Samsung Galaxy S8+',
        width: 360,
        height: 740
    },
    'Samsung Galaxy S20 Ultra': {
        name: 'Samsung Galaxy S20 Ultra',
        width: 412,
        height: 915
    },
    'iPad Mini': {
        name: 'iPad Mini',
        width: 768,
        height: 1024
    },
    'iPad Air': {
        name: 'iPad Air',
        width: 820,
        height: 1180
    },
    'iPad Pro': {
        name: 'iPad Pro',
        width: 1024,
        height: 1366
    },
    'Surface Pro 7': {
        name: 'Surface Pro 7',
        width: 912,
        height: 1368
    },
    'Surface Duo': {
        name: 'Surface Duo',
        width: 540,
        height: 720
    },
    'Galaxy Fold': {
        name: 'Galaxy Fold',
        width: 280,
        height: 653
    },
    'Asus Zenbook Fold': {
        name: 'Asus Zenbook Fold',
        width: 853,
        height: 1280
    },
    'Samsung Galaxy A51/71': {
        name: 'Samsung Galaxy A51/71',
        width: 412,
        height: 914
    },
    'Nest Hub': {
        name: 'Nest Hub',
        width: 1024,
        height: 600
    },
    'Nest Hub Max': {
        name: 'Nest Hub Max',
        width: 1280,
        height: 800
    }
}

export default devices
