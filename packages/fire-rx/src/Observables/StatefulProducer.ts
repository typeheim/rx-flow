import { Observable } from 'rxjs'

import { ReadonlyStream } from './ReadonlyStream'
import { Producer } from '../Contracts/Observables'
import { Subscribable } from '../Contracts/RxJsInternals'
import { StatefulSubject } from './StatefulSubject'

export class StatefulProducer<T> extends Observable<T> implements Producer<T> {
    protected internalSubject = new StatefulSubject<T>()

    constructor(executor: (state: ProducerState<T>) => void) {
        super()
        this.source = this.internalSubject
        let state = {
            next: (value?) => this.internalSubject.next(value),
            stop: () =>  this.internalSubject.stop(),
            fail: (error) => this.internalSubject.fail(error),
        }
        executor(state)
    }

    get isStopped() {
        return this.internalSubject.isStopped
    }

    get closed() {
        return this.internalSubject.closed
    }

    /**
     * Subscribe to a destruction event to complete and stop as it
     * emits
     */
    emitUntil(destroyEvent: Subscribable<any>) {
        this.internalSubject.emitUntil(destroyEvent)

        return this
    }

    /**
     * Create readonly stream with this producer as source
     */
    toReadonlyStream(): ReadonlyStream<T> {
        return this.internalSubject.toReadonlyStream()
    }

    /**
     * Completes producer and clean up resources
     */
    stop(): void {
        this.internalSubject.stop()
    }

    /**
     * Completes producer with error and unsubscribe all subscriptions
     */
    fail(error: any): void {
        this.internalSubject.fail(error)
    }

    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2> {
        return this.internalSubject.then(onfulfilled, onrejected)
    }

    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult> {
        return this.internalSubject.catch(onrejected)
    }

    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T> {
        return this.internalSubject.finally(onfinally)
    }
}

export interface ProducerState<T> {
    next: (value?: T) => void
    stop: () => void
    fail: (error: any) => void
}
