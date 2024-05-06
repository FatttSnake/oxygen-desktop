import { DependencyList, EffectCallback } from 'react'

export const useUpdatedEffect = (effect: EffectCallback, dependencies: DependencyList) => {
    const isFirstRender = useRef(true)

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
        } else {
            return effect()
        }
    }, dependencies)
}

export const usePrevious = <T,>(value: T): T | undefined => {
    const ref = useRef<T>()
    useEffect(() => {
        ref.current = value
    })
    return ref.current
}
