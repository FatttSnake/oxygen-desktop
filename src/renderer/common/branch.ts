import frame from '../frame/main'
import main from '../main/main'

switch (oxygenApi.renderer) {
    case 'frame':
        frame()
        break
    default:
        main()
}
