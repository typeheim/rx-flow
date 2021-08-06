import {
    DestroyEvent,
    StatefulStream,
} from '../index'

describe('StatefulStream', () => {
    it('can push data to subscriptions', () => {
        let stream = new StatefulStream<number>((state) => {
            state.next(1)
        })
        let subscriptions = []
        let dataStorage = []

        subscriptions.push(stream.subscribe(data => dataStorage.push(data)))
        subscriptions.push(stream.subscribe(data => dataStorage.push(data)))

        stream.complete()

        expect(stream.isStopped).toBeTruthy()
        expect(stream.closed).toBeFalsy()

        expect(dataStorage.length).toEqual(2)
        expect(subscriptions[0].closed).toBeTruthy()
        expect(subscriptions[1].closed).toBeTruthy()
    })

    it('can fail', () => {
        let stream = new StatefulStream<number>((state) => {
            state.fail(new Error())
        })

        expect(stream.hasError).toBeTruthy()
        expect(stream.isStopped).toBeTruthy()
        expect(stream.closed).toBeFalsy()
    })

    it('can stop', () => {
        let stream = new StatefulStream<number>((state) => {
            state.stop()
        })

        expect(stream.isStopped).toBeTruthy()
        expect(stream.hasError).toBeFalsy()
        expect(stream.closed).toBeFalsy()
    })

    it('unsubscribe all subscriptions on destroy event', () => {
        let stream = new StatefulStream<number>((state) => {
            state.next(1)
        })
        let destroyEvent = new DestroyEvent()

        stream.emitUntil(destroyEvent)

        let subscriptions = []

        subscriptions.push(stream.subscribe(data => data))
        subscriptions.push(stream.subscribe(data => data))

        destroyEvent.emit()

        expect(stream.isStopped).toBeTruthy() // complete() should stop producer
        expect(stream.closed).toBeFalsy() // complete() should not close producer

        expect(subscriptions[0].closed).toBeTruthy()
        expect(subscriptions[0].closed).toBeTruthy()
    })

    it('is awaitable', async () => {
        let stream = new StatefulStream<number>((state) => {
            state.next(1)
        })
        let data = await stream

        stream.complete()

        expect(data).toEqual(1)
    })
})

