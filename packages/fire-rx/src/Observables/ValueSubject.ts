import {
    BehaviorSubject,
    Subscribable,
} from 'rxjs'
import { SubscriptionsHub } from '../Utils/SubscriptionsHub'
import { ReadonlyStream } from './ReadonlyStream'

export class ValueSubject<T> extends BehaviorSubject<T> {
    protected _internalPromise: Promise<T>
    protected _emitsCount = 0
    protected hub = new SubscriptionsHub()

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
     * Subscribe to a destruction event to complete and unsubscribe as it
     * emits
     */
    emitUntil(destroyEvent: Subscribable<any>) {
        destroyEvent.subscribe(() => {
            this.stop()
        })

        return this
    }

    stop() {
        if (!this.isStopped) {
            this.complete()
        }
        this.hub.unsubscribe()
        if (!this.closed) {
            this.unsubscribe()
        }
        this._internalPromise = null
    }

    /**
     * Completes subject with error and unsubscribe all subscriptions
     */
    fail(error) {
        this.error(error)
        this.hub.unsubscribe()

        if (!this.closed) {
            this.unsubscribe()
        }
    }

    toReadonlyStream(): ReadonlyStream<T> {
        const observable = new ReadonlyStream<T>();
        (<any>observable).source = this

        return observable
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
                this.subscribe({
                    next: (data) => {
                        lastValue = data

                        // promise should return only one value and then being destroyed
                        this._internalPromise = null
                        resolve(data)
                    },
                    error: (error) => {
                        // promise should return only one value and then being destroyed
                        this._internalPromise = null
                        reject(error)
                    },
                    complete: () => {
                        // promise should return only one value and then being destroyed
                        this._internalPromise = null
                        resolve(lastValue)
                    },
                })
            })
        }

        return this._internalPromise
    }

    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2> {
        return this.internalPromise.then(onfulfilled)
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
