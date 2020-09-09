import {
    DestroyEvent,
    StatefulStream,
} from '../index'

describe('StatefulStream', () => {
    it('can push data to subscriptions', async (done) => {
        let stream = new StatefulStream<number>((state) => {
            state.next(1)
        })
        let subscriptions = []
        let dataStorage = []

        subscriptions.push(stream.subscribe(data => dataStorage.push(data)))
        subscriptions.push(stream.subscribe(data => dataStorage.push(data)))

        stream.stop()

        expect(stream.isStopped).toBeTruthy()
        expect(stream.closed).toBeFalsy()

        expect(dataStorage.length).toEqual(2)
        expect(subscriptions[0].closed).toBeTruthy()
        expect(subscriptions[1].closed).toBeTruthy()

        done()
    })

    it('can fail', async (done) => {
        let stream = new StatefulStream<number>((state) => {
            state.fail(new Error())
        })

        expect(stream.hasError).toBeTruthy()
        expect(stream.isStopped).toBeTruthy()
        expect(stream.closed).toBeFalsy()

        done()
    })

    it('can stop', async (done) => {
        let stream = new StatefulStream<number>((state) => {
            state.stop()
        })

        expect(stream.isStopped).toBeTruthy()
        expect(stream.hasError).toBeFalsy()
        expect(stream.closed).toBeFalsy()

        done()
    })

    it('unsubscribe all subscriptions on destory event', async (done) => {
        let stream = new StatefulStream<number>((state) => {
            state.next(1)
        })
        let destroyEvent = new DestroyEvent()

        stream.emitUntil(destroyEvent)

        let subscriptions = []

        subscriptions.push(stream.subscribe(data => data))
        subscriptions.push(stream.subscribe(data => data))

        destroyEvent.emit()

        expect(stream.isStopped).toBeTruthy() // stop() should stop producer
        expect(stream.closed).toBeFalsy() // stop() should not close producer

        expect(subscriptions[0].closed).toBeTruthy()
        expect(subscriptions[0].closed).toBeTruthy()

        done()
    })

    it('is awaitable', async (done) => {
        let stream = new StatefulStream<number>((state) => {
            state.next(1)
        })
        let data = await stream

        stream.stop()

        expect(data).toEqual(1)

        done()
    })
})

