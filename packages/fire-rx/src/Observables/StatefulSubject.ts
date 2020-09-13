import {
    SchedulerLike,
    ReplaySubject,
    Subscription,
} from 'rxjs'
import { Publisher } from '../Contracts/Observables'
import { Subscribable } from '../Contracts/RxJsInternals'
import { ReactiveStream } from './ReactiveStream'

export class StatefulSubject<T> extends ReplaySubject<T> implements Publisher<T> {
    protected _internalPromise: Promise<T>
    protected promiseSubscription: Subscription
    protected _emitsCount = 0
    protected hub = new Subscription()

    constructor(bufferSize: number = 1, windowTime: number = Number.POSITIVE_INFINITY, scheduler?: SchedulerLike) {
        super(bufferSize, windowTime, scheduler)
    }

    get emitsCount() {
        return this._emitsCount
    }

    next(value?: T): void {
        this._emitsCount++
        super.next(value)
    }

    /**
     * @deprecated internal method
     */
    _subscribe(subscriber) {
        let sub = super._subscribe(subscriber)
        this.hub.add(sub)

        return sub
    }

    /**
     * Subscribe to an event to complete and unsubscribe as it
     * emits
     */
    emitUntil(event: Subscribable<any>): this {
        event.subscribe(() => {
            this.stop()
        })

        return this
    }

    /**
     * Create readonly stream with this subject as source
     */
    asStream(): ReactiveStream<T> {
        return new ReactiveStream(this)
    }

    /**
     * Completes subject and clean up resources
     */
    stop(): void {
        if (this.hasError) {
            // if subject was failed, further steps ain't necessary
            return
        }
        if (!this.isStopped) {
            this.complete()
        }
        this.hub.unsubscribe()
        this.clearInternalPromise()
    }

    /**
     * Completes subject with error and unsubscribe all subscriptions
     */
    fail(error): void {
        this.error(error)
        this.hub.unsubscribe()
    }

    //
    // Promise interface
    //

    protected get internalPromise(): Promise<T> {
        if (!this._internalPromise) {
            // in order for promise to properly return values from subject, it's required to "resolve" each "next" value
            // and to keep behavior consistent, there's a storage variable "lastValue" that will be resolved on subject completion
            let lastValue = null
            this._internalPromise = new Promise<T>((resolve, reject) => {
                this.promiseSubscription = this.subscribe({
                    next: (data) => {
                        lastValue = data

                        // promise should return only one value and then being destroyed
                        this.clearInternalPromise()
                        resolve(data)
                    },
                    error: (error) => {
                        // promise should return only one value and then being destroyed
                        this.clearInternalPromise()
                        reject(error)
                    },
                    complete: () => {
                        // promise should return only one value and then being destroyed
                        this.clearInternalPromise()
                        resolve(lastValue)
                    },
                })
            })
        }

        return this._internalPromise
    }

    protected clearInternalPromise() {
        this._internalPromise = null
        if (this.promiseSubscription) {
            this.promiseSubscription.unsubscribe()
            this.promiseSubscription = null
        }
    }

    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2> {
        return this.internalPromise.then(onfulfilled, onrejected)
    }

    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult> {
        return this.internalPromise.catch(onrejected)
    }

    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T> {
        return this.internalPromise.finally(onfinally)
    }
}
