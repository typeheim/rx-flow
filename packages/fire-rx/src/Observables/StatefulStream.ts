import { Observer } from '../Contracts/Observables'
import { StatefulSubject } from './StatefulSubject'
import { ReactiveStream } from './ReactiveStream'

export class StatefulStream<T> extends ReactiveStream<T> {
    protected sourceSubject: StatefulSubject<T>

    constructor(dataSource: (context: StreamContext<T>) => void) {
        super(new StatefulSubject())
        let state = {
            next: (value?) => this.sourceSubject.next(value),
            stop: () => this.sourceSubject.stop(),
            fail: (error) => this.sourceSubject.fail(error),
            isFinished: () => this.isStopped || this.closed,
            isFailed: () => this.sourceSubject.hasError,
            subscribe: (observer: ((value: T) => void) | Observer<T>) => this.subscribe(observer as any),
        }
        dataSource(state)
    }
}

/**
 * @deprecated
 */
export class StatefulProducer<T> extends StatefulStream<T> {}

export interface StreamContext<T> {
    next: (value?: T) => void
    stop: () => void
    fail: (error: any) => void
    isFinished: () => boolean
    isFailed: () => boolean
    subscribe: (observer: ((value: T) => void) | Observer<T>) => void
}
