import {
    Subscribable,
    Observable,
} from 'rxjs'
import { StatefulSubject } from './StatefulSubject'

export class ReactivePromise<T> extends Observable<T> {
    protected internalPromise: Promise<T>
    protected internalSubject = new StatefulSubject<T>(1)
    protected value: T
    protected _resolved = false


    constructor(executor?: PromiseExecutor<T>) {
        super()
        this.source = this.internalSubject
        this.internalPromise = new Promise<T>((resolve, reject) => {
            this.subscribe({
                next: (data) => {
                    resolve(data)
                },
                error: error => {
                    reject(error)
                },
                complete: () => {
                    resolve(this.value)
                },
            })
        })

        let state = {
            resolve: (value?) => this.resolve(value),
            reject: (reason) => this.reject(reason),
        }

        if (executor) {
            executor(state)
        }
    }

    get resolved() {
        return this._resolved
    }

    resolve(value?: T): void {
        if (this.resolved) {
            throw PromiseResolvedException.withMessage('Promise already resolved')
        }
        this.value = value
        this._resolved = true
        this.internalSubject.next(value)
        this.internalSubject.stop()
    }

    reject(error?: any) {
        if (this.resolved) {
            throw PromiseResolvedException.withMessage('Promise already resolved')
        }
        this.internalSubject.fail(error)
    }

    resolveOn(resolveEventOrConfig: ResolveOnConfig<T> | Subscribable<any>) {
        let resolveEvent = null
        let resolveValue = null
        if (resolveEventOrConfig['event']) {
            resolveEvent = resolveEventOrConfig['event']
            resolveValue = resolveEventOrConfig['value']
        } else {
            resolveEvent = resolveEventOrConfig
        }

        resolveEvent.subscribe(() => {
            if (!this.resolved) {
                this.resolve(resolveValue)
            }
        })

        return this
    }

    /**
     * @deprecated will be removed in next release
     */
    emitUntil(destroyEvent: Subscribable<any>) {
        destroyEvent.subscribe(() => {
            if (!this.resolved) {
                this.internalSubject.stop()
            }
        })

        return this
    }

    //
    //
    // PROMISE INTERFACE
    //
    //

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

export interface ResolveOnConfig<T> {
    event: Subscribable<any>
    value: T
}

export type PromiseExecutor<T> = (state: PromiseState<T>) => void

export interface PromiseState<T> {
    resolve: (value?: T) => void
    reject: (error: any) => void
}

export class PromiseResolvedException extends Error {
    protected constructor(message: string) {super(message)}

    static withMessage(message: string) {
        return new PromiseResolvedException(message)
    }
}
