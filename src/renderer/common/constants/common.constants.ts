export const PRODUCTION_NAME = 'Oxygen Toolbox'
export const STORAGE_TOKEN_KEY = 'JWT_TOKEN'
export const STORAGE_USER_INFO_KEY = 'USER_INFO'
export const STORAGE_TOOL_MENU_ITEM_KEY = 'TOOL_MENU_ITEM'
export const STORAGE_THEME_MODE_KEY = 'THEME_MODE'
export const COLOR_PRODUCTION = '#4E47BB'
export const THEME_FOLLOW_SYSTEM = 'FOLLOW_SYSTEM'
export const THEME_LIGHT = 'LIGHT'
export const THEME_DARK = 'DARK'

/**
 * Response code
 */
export const SYSTEM_OK = 10000

export const SYSTEM_ERROR = 10050
export const SYSTEM_TIMEOUT = 10051
export const SYSTEM_REQUEST_ILLEGAL = 10052
export const SYSTEM_ARGUMENT_NOT_VALID = 10053
export const SYSTEM_INVALID_CAPTCHA_CODE = 10054
export const SYSTEM_REQUEST_TOO_FREQUENT = 10055
export const SYSTEM_MATCH_SENSITIVE_WORD = 10056

export const PERMISSION_LOGIN_SUCCESS = 20000
export const PERMISSION_PASSWORD_CHANGE_SUCCESS = 20001
export const PERMISSION_LOGOUT_SUCCESS = 20002
export const PERMISSION_TOKEN_RENEW_SUCCESS = 20003
export const PERMISSION_REGISTER_SUCCESS = 20004
export const PERMISSION_RESEND_SUCCESS = 20005
export const PERMISSION_VERIFY_SUCCESS = 20006
export const PERMISSION_FORGET_SUCCESS = 20007
export const PERMISSION_RETRIEVE_SUCCESS = 20008

export const PERMISSION_UNAUTHORIZED = 20050
export const PERMISSION_USERNAME_NOT_FOUND = 20051
export const PERMISSION_ACCESS_DENIED = 20052
export const PERMISSION_USER_LOCKED = 20053
export const PERMISSION_USER_EXPIRED = 20054
export const PERMISSION_USER_CREDENTIALS_EXPIRED = 20055
export const PERMISSION_USER_DISABLE = 20056
export const PERMISSION_LOGIN_USERNAME_PASSWORD_ERROR = 20057
export const PERMISSION_OLD_PASSWORD_NOT_MATCH = 20058
export const PERMISSION_LOGOUT_FAILED = 20059
export const PERMISSION_TOKEN_ILLEGAL = 20060
export const PERMISSION_TOKEN_HAS_EXPIRED = 20061
export const PERMISSION_NO_VERIFICATION_REQUIRED = 20062
export const PERMISSION_VERIFY_CODE_ERROR_OR_EXPIRED = 20063
export const PERMISSION_ACCOUNT_NEED_INIT = 20064
export const PERMISSION_USER_NOT_FOUND = 20065
export const PERMISSION_RETRIEVE_CODE_ERROR_OR_EXPIRED = 20066
export const PERMISSION_ACCOUNT_NEED_RESET_PASSWORD = 20067
export const PERMISSION_NEED_TWO_FACTOR = 20068
export const PERMISSION_ALREADY_HAS_TWO_FACTOR = 20069
export const PERMISSION_NO_TWO_FACTOR_FOUND = 20070
export const PERMISSION_TWO_FACTOR_VERIFICATION_CODE_ERROR = 20071

export const DATABASE_SELECT_SUCCESS = 30000
export const DATABASE_SELECT_FAILED = 30005
export const DATABASE_INSERT_SUCCESS = 30010
export const DATABASE_INSERT_FAILED = 30015
export const DATABASE_UPDATE_SUCCESS = 30020
export const DATABASE_UPDATE_FILED = 30025
export const DATABASE_DELETE_SUCCESS = 30030
export const DATABASE_DELETE_FILED = 30035
export const DATABASE_EXECUTE_ERROR = 30050
export const DATABASE_DUPLICATE_KEY = 30051
export const DATABASE_NO_RECORD_FOUND = 30052

export const TOOL_SUBMIT_SUCCESS = 40010
export const TOOL_CANCEL_SUCCESS = 40011
export const TOOL_ILLEGAL_VERSION = 40050
export const TOOL_UNDER_REVIEW = 40051
export const TOOL_NOT_UNDER_REVIEW = 40052
export const TOOL_HAS_UNPUBLISHED_VERSION = 40053
export const TOOL_HAS_NOT_BEEN_PUBLISHED = 40054
export const TOOL_HAS_BEEN_PUBLISHED = 40055
export const TOOL_SUBMIT_ERROR = 40060
export const TOOL_CANCEL_ERROR = 40061

export const API_AVATAR_SUCCESS = 50100
export const API_AVATAR_ERROR = 50150

export const H_CAPTCHA_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY
