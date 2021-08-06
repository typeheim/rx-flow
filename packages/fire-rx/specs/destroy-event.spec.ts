import {
    DestroyEvent,
    StatefulSubject,
    SubscriptionsHub,
} from '..'
import { ReplaySubject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'

describe('DestroyEvent', () => {
    it('can be used with takeUntil',  () => {
        let destroyEvent = new DestroyEvent()

        let subject = new ReplaySubject(1)
        let sub = subject.pipe(takeUntil(destroyEvent)).subscribe(data => data)

        destroyEvent.emit()
        // DestroyEvent through takeUntil should close subscription
        expect(sub.closed).toEqual(true)
        // DestroyEvent through takeUntil does not close or stop source
        expect(subject.closed).toEqual(false)
        expect(subject.isStopped).toEqual(false)

        subject.complete()
    })

    it('can be used with SubscriptionsHub', () => {
        let destroyEvent = new DestroyEvent()
        let hub = new SubscriptionsHub(destroyEvent)
        let subject = new ReplaySubject(1)

        hub.add(subject.subscribe((data => data)))
        hub.add(subject.subscribe((data => data)))
        hub.add(subject.subscribe((data => data)))

        expect(hub.count).toEqual(3)

        destroyEvent.emit()

        expect(hub.count).toEqual(0)

        subject.complete()
    })

    it('can be used with `until` method of StatefulSubject', () => {
        let destroyEvent = new DestroyEvent()

        let subject = new StatefulSubject(1)
        subject.emitUntil(destroyEvent)

        let sub1 = subject.subscribe((data => data))
        let sub2 = subject.subscribe((data => data))
        let sub3 = subject.subscribe((data => data))

        subject.next()

        expect(subject.closed).toEqual(false)

        destroyEvent.emit()

        // after destroy event is emitted
        expect(subject.isStopped).toEqual(true)
        expect(sub1.closed).toEqual(true)
        expect(sub2.closed).toEqual(true)
        expect(sub3.closed).toEqual(true)
    })
})
