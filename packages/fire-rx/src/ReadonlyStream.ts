import { Observable } from 'rxjs'

export class ReadonlyStream<T> extends Observable<T> {
    stop() {
        //@ts-ignore
        this.source.stop()
    }
}
