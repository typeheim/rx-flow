import { StatefulSubject } from '..'

describe('StatefulSubject', () => {
    it('can be executed as promise', async (done) => {
        let subject = new StatefulSubject<number>(1)

        subject.next(5)
        let value = await subject
        expect(value).toEqual(5)

        subject.next(6)
        let nextValue = await subject

        expect(nextValue).toEqual(6)

        subject.complete()
        subject.unsubscribe()

        done()
    })

    it('can replay values as promise', async (done) => {
        let subject = new StatefulSubject<number>(1)

        subject.next(5)
        expect(await subject).toEqual(5)
        expect(await subject).toEqual(5)

        subject.next(6)
        expect(await subject).toEqual(6)
        expect(await subject).toEqual(6)

        subject.complete()

        expect(await subject).toEqual(6)

        subject.complete()
        subject.unsubscribe()

        done()
    })

    it('can be run as typical subject', async (done) => {
        let subject = new StatefulSubject<number>(1)

        subject.next(5)

        let value = await subject.subscribe(value => {
            expect(value).toEqual(5)
            subject.complete()
            subject.unsubscribe()
            done()
        })
    })

    it('should be stoppable from streams', async (done) => {
        let subject = new StatefulSubject<number>()
        let stream = subject.asStream()
        let stream2 = subject.asStream()

        let sub = stream.subscribe(data => {})
        let sub2 = stream.subscribe(data => {})
        let sub3 = stream.subscribe(data => {})

        let independentSub = stream2.subscribe(data => {})

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
})
