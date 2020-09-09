import { StatefulSubject } from '..'
import { ReactiveStream } from '../src/Observables/ReactiveStream'
import { map } from 'rxjs/operators'

describe('ReactiveStream', () => {
    it('can stop source subject', async (done) => {
        let subject = new StatefulSubject()
        let stream = new ReactiveStream(subject)

        let sub = stream.subscribe(data => {})
        let sub2 = stream.subscribe(data => {})
        let sub3 = stream.subscribe(data => {})

        stream.stop()

        // stream should stop source subject but not close
        expect(subject.isStopped).toBeTruthy()
        expect(subject.closed).toBeFalsy()

        // subscriptions should be closed when subject stop
        expect(sub.closed).toBeTruthy()
        expect(sub2.closed).toBeTruthy()
        expect(sub3.closed).toBeTruthy()

        done()
    })

    it('should close own and source subject subscriptions', async (done) => {
        let subject = new StatefulSubject<number>()
        let stream = new ReactiveStream(subject)

        let sub = stream.subscribe(data => {})
        let sub2 = stream.subscribe(data => {})
        let sub3 = stream.subscribe(data => {})

        let independentSub = subject.subscribe(data => {})

        stream.stop()

        // stream should stop source subject but not close
        expect(subject.isStopped).toBeTruthy()
        expect(subject.closed).toBeFalsy()

        // subscriptions should be closed when subject stop
        expect(sub.closed).toBeTruthy()
        expect(sub2.closed).toBeTruthy()
        expect(sub3.closed).toBeTruthy()
        expect(independentSub.closed).toBeTruthy()

        done()
    })

    it('is pipeable in streams', async (done) => {
        let subject = new StatefulSubject<number>()
        let stream = new ReactiveStream(subject.pipe(map((data) => 5)), subject)

        subject.next(1)

        let data = await stream
        expect(data).toEqual(5)

        stream.subscribe(data => {
            // stream should stop source subject but not close
            expect(data).toEqual(5)
            stream.stop()

            // stream should stop source subject but not close
            expect(subject.isStopped).toBeTruthy()
            expect(subject.closed).toBeFalsy()

            done()
        })
    })
})
