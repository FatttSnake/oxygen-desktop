import { getAuthRoute } from '$/util/route'

const systemSettings: RouteJsonObject[] = []

export const getSystemSettingsRouteJson = () => getAuthRoute(systemSettings)

export default systemSettings
