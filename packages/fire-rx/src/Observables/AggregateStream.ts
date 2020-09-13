import {
    Observable,
    combineLatest,
} from 'rxjs'

export class AggregateStream<T> extends Observable<T> {
    constructor(sources: any[]) {
        super()
        this.source = combineLatest(sources)
    }
}
