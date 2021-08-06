import {
    Observable,
    Subscribable,
} from 'rxjs'
import { Publisher } from '@typeheim/fire-rx'
import { AsyncStream } from './AsyncStream'

export class ReactiveStream<T> extends AsyncStream<T> implements Publisher<T> {
    protected sourceSubject: Publisher<T>

    constructor(dataSource: Observable<any> | Publisher<any>, sourceSubject?: Publisher<any>) {
        super(dataSource)

        this.sourceSubject = sourceSubject ?? dataSource as Publisher<any>
    }

    get isStopped() {
        return this.sourceSubject.isStopped
    }

    get closed() {
        return this.sourceSubject.closed
    }

    get hasError() {
        return this.sourceSubject.hasError
    }

    /**
     * Subscribe to a destruction event to complete and stop as it
     * emits
     */
    emitUntil(destroyEvent: Subscribable<any>) {
        this.sourceSubject.emitUntil(destroyEvent)

        return this
    }

    /**
     * @deprecated use {@link complete()} instead
     */
    stop(): void {
        this.complete()
    }

    /**
     * Completes producer and clean up resources
     */
    complete(): void  {
        this.sourceSubject.complete()
    }

    /**
     * @deprecated use {@link error()} instead
     */
    fail(error: any): void {
        this.error(error)
    }

    /**
     * Completes producer with error and unsubscribe all subscriptions
     */
    error(error: any): void  {
        this.sourceSubject.error(error)
    }
}
