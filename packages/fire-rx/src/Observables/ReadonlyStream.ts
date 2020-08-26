import { Observable } from 'rxjs'

export class ReadonlyStream<T> extends Observable<T> {
    /**
     * Stop source.
     */
    stop(): void {
        //@ts-ignore
        this.source.stop()
    }
}
