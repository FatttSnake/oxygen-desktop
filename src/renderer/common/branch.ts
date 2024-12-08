import frame from '../frame/main'
import menu from '../menu/main'
import main from '../main/main'

switch (oxygenApi.renderer) {
    case 'frame':
        frame()
        break
    case 'menu':
        menu()
        break
    default:
        main()
}
