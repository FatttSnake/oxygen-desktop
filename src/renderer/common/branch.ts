import frame from '../frame/main'
import main from '../main/main'
import settings from '../settings/main'

switch (oxygenApi.renderer) {
    case 'frame':
        frame()
        break
    case 'settings':
        settings()
        break
    default:
        main()
}
