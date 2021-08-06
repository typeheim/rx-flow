import { Observable } from 'rxjs'
import { StatefulSubject } from '../..'

/**
 * Special type of subject that should be used in pair with `until` method of
 * Fire subjects to complete them.
 */
export class DestroyEvent extends Observable<boolean> {
    protected internalSubject = new StatefulSubject<boolean>()

    constructor() {
        super()
        this.source = this.internalSubject
    }

    public emit() {
        this.internalSubject.next(true)

        this.internalSubject.complete()
    }
}
