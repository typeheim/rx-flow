import { Observable } from 'rxjs'

/**
 * @deprecated in favour for { ReactiveStream }
 */
export class ReadonlyStream<T> extends Observable<T> {
    /**
     * Stop source.
     */
    stop(): void {
        //@ts-ignore
        this.source.stop()
    }
}
