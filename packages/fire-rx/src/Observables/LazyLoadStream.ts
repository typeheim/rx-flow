import { Observable } from 'rxjs'
import { AsyncStream } from './AsyncStream'

export class LazyLoadStream<T> extends AsyncStream<T> {
    protected isInitialized: boolean = false
    protected dataSource: () => Observable<T>

    constructor(dataSource: () => Observable<T>) {
        super(null)
        this.dataSource = dataSource
    }

    /**
     * @deprecated internal method
     */
    protected _subscribe(subscriber) {
        if (!this.isInitialized) {
            this.initDataSource()
        }

        // @ts-ignore
        return super._subscribe(subscriber)
    }

    protected initDataSource() {
        this.isInitialized = true
        this.source = this.dataSource()
    }
}
