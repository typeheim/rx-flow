import { Observer } from 'rxjs'

export interface StreamContext<T> {
    next: (value?: T) => void
    stop: () => void
    fail: (error: any) => void
    isFinished: () => boolean
    isFailed: () => boolean
    subscribe: (observer: ((value: T) => void) | Observer<T>) => void
}
