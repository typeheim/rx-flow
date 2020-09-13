import { Observable } from 'rxjs'
import { Publisher } from '@typeheim/fire-rx'

export class AsyncStream<T> extends Observable<T> {
    protected _internalPromise: Promise<T>
    protected promiseSubscription

    constructor(dataSource: Observable<any> | Publisher<any>) {
        super()

        this.source = dataSource as Observable<any>
    }

    asObservable(): Observable<T> {
        let obs = new Observable<T>()
        obs.source = this

        return obs
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
