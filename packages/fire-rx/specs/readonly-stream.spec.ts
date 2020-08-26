import { StatefulSubject } from '..'

describe('ReadonlyStream', () => {
    it('can stop source subject', async (done) => {
        let subject = new StatefulSubject<number>()
        let stream = subject.toReadonlyStream()

        let sub = stream.subscribe(data => {})
        let sub2 = stream.subscribe(data => {})
        let sub3 = stream.subscribe(data => {})

        stream.stop()

        // stream should stop source subject
        expect(subject.isStopped).toBeTruthy()
        expect(subject.closed).toBeTruthy()

        // subscriptions should be closed when subject stop
        expect(sub.closed).toBeTruthy()
        expect(sub2.closed).toBeTruthy()
        expect(sub3.closed).toBeTruthy()

        done()
    })

    it('should close subscription from other subjects', async (done) => {
        let subject = new StatefulSubject<number>()
        let stream = subject.toReadonlyStream()
        let stream2 = subject.toReadonlyStream()

        let sub = stream.subscribe(data => {})
        let sub2 = stream.subscribe(data => {})
        let sub3 = stream.subscribe(data => {})

        let independentSub = stream2.subscribe(data => {})

        stream.stop()

        // stream should stop source subject
        expect(subject.isStopped).toBeTruthy()
        expect(subject.closed).toBeTruthy()

        // subscriptions should be closed when subject stop
        expect(sub.closed).toBeTruthy()
        expect(sub2.closed).toBeTruthy()
        expect(sub3.closed).toBeTruthy()
        expect(independentSub.closed).toBeTruthy()

        done()
    })
})
