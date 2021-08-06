import { StatefulSubject } from './StatefulSubject'
import { ReactiveStream } from './ReactiveStream'
import { StreamContext } from '../Contracts/Streams'
import { Observer } from 'rxjs'

export class StatefulStream<T> extends ReactiveStream<T> {
    protected sourceSubject: StatefulSubject<T>

    constructor(dataSource: (context: StreamContext<T>) => void) {
        super(new StatefulSubject())
        let state = {
            next: (value?) => this.sourceSubject.next(value),
            stop: () => this.sourceSubject.complete(),
            fail: (error) => this.sourceSubject.error(error),
            isFinished: () => this.isStopped || this.closed,
            isFailed: () => this.sourceSubject.hasError,
            subscribe: (observer: ((value: T) => void) | Observer<T>) => this.subscribe(observer as any),
        }
        dataSource(state)
    }
}


