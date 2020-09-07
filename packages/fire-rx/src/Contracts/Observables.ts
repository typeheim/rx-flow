import {
    Subscribable,
} from 'rxjs'
import { ReadonlyStream } from '../Observables/ReadonlyStream'

export interface Producer<T> extends Subscribable<T> {
    /**
     * Subscribe to a destruction event to complete and unsubscribe as it
     * emits
     */
    emitUntil(destroyEvent: Subscribable<any>): this

    /**
     * Create readonly stream with this producer as source
     */
    toReadonlyStream(): ReadonlyStream<T>

    /**
     * Completes producer and clean up resources
     */
    stop(): void

    /**
     * Completes producer with error and unsubscribe all subscriptions
     */
    fail(error): void
}

export interface Observer<T> {
    closed?: boolean;
    next?: (value: T) => void;
    error?: (err: any) => void;
    complete?: () => void;
}
