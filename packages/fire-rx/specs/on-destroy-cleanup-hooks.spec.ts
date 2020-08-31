import {
    ValueSubject,
    StopOnDestroy,
    StatefulSubject,
    CompleteOnDestroy,
    UnsubscribeOnDestroy,
} from '..'
import { ReplaySubject } from 'rxjs'

describe('*OnDestroy cleanup hooks', () => {
    function verifySubjectsAreStopped(object) {
        expect(object.valueSubject.isStopped).toBeTruthy()
        expect(object.valueSubject.closed).toBeFalsy()

        expect(object.statefulSubject.isStopped).toBeTruthy()  // stop hook should stop subject
        expect(object.statefulSubject.closed).toBeFalsy() // stop hook should not close subject

        expect(object.notStoppableSubject.isStopped).toBeFalsy()
        expect(object.notStoppableSubject.closed).toBeFalsy()

        expect(object.completableSubject.isStopped).toBeTruthy()
        expect(object.completableSubject.closed).toBeFalsy()

        expect(object.unsubscribableSubject.isStopped).toBeTruthy()
        expect(object.unsubscribableSubject.closed).toBeTruthy()
    }

    it('add destructor if it\'s missing and cleanup resources', async (done) => {
        let withoutDestructorObj = new WithoutDestructor()

        // @ts-ignore
        withoutDestructorObj.ngOnDestroy()

        verifySubjectsAreStopped(withoutDestructorObj)

        done()
    })

    it('add destructor if it\'s missing and cleanup resources', async (done) => {
        let withNgDestructorObj = new WithNgDestructor()

        // @ts-ignore
        withNgDestructorObj.ngOnDestroy()

        expect(withNgDestructorObj.destroyed).toBeTruthy()

        verifySubjectsAreStopped(withNgDestructorObj)

        done()
    })

    it('add destructor if it\'s missing and cleanup resources', async (done) => {
        let withCustomDestructorObj = new WithCustomDestructor()

        withCustomDestructorObj.myDestructor()

        expect(withCustomDestructorObj.destroyed).toBeTruthy()

        verifySubjectsAreStopped(withCustomDestructorObj)

        done()
    })
})

class WithoutDestructor {
    @StopOnDestroy()
    valueSubject = new ValueSubject(1)

    @StopOnDestroy()
    statefulSubject = new StatefulSubject()

    @CompleteOnDestroy()
    completableSubject = new ReplaySubject()

    @UnsubscribeOnDestroy()
    unsubscribableSubject = new ReplaySubject()

    notStoppableSubject = new ReplaySubject().asObservable()
}

class WithNgDestructor {
    @StopOnDestroy()
    valueSubject = new ValueSubject(1)

    @StopOnDestroy()
    statefulSubject = new StatefulSubject()

    @CompleteOnDestroy()
    completableSubject = new ReplaySubject()

    @UnsubscribeOnDestroy()
    unsubscribableSubject = new ReplaySubject()

    notStoppableSubject = new ReplaySubject()

    // flag to check original destructor is executed
    destroyed = false

    ngOnDestroy() {
        this.destroyed = true
    }
}

const destroyHook = { destroyHook: 'myDestructor' }

class WithCustomDestructor {
    @StopOnDestroy(destroyHook)
    valueSubject = new ValueSubject(1)

    @StopOnDestroy(destroyHook)
    statefulSubject = new StatefulSubject()

    @CompleteOnDestroy(destroyHook)
    completableSubject = new ReplaySubject()

    @UnsubscribeOnDestroy(destroyHook)
    unsubscribableSubject = new ReplaySubject()

    notStoppableSubject = new ReplaySubject()

    // flag to check original destructor is executed
    destroyed = false

    myDestructor() {
        this.destroyed = true
    }
}
