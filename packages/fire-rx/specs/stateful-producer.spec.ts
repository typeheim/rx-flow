import {
    DestroyEvent,
    StatefulProducer,
} from '../index'

describe('StatefulProducer', () => {
    it('can push data to subscriptions', async (done) => {
        let producer = new StatefulProducer<number>((state) => {
            state.next(1)
        })
        let subscriptions = []
        let dataStorage = []

        subscriptions.push(producer.subscribe(data => dataStorage.push(data)))
        subscriptions.push(producer.subscribe(data => dataStorage.push(data)))

        producer.stop()

        expect(producer.isStopped).toBeTruthy()
        expect(producer.closed).toBeFalsy()

        expect(dataStorage.length).toEqual(2)
        expect(subscriptions[0].closed).toBeTruthy()
        expect(subscriptions[1].closed).toBeTruthy()

        done()
    })

    it('unsubscribe all subscriptions on destory event', async (done) => {
        let producer = new StatefulProducer<number>((state) => {
            state.next(1)
        })
        let destroyEvent = new DestroyEvent()

        producer.emitUntil(destroyEvent)

        let subscriptions = []

        subscriptions.push(producer.subscribe(data => data))
        subscriptions.push(producer.subscribe(data => data))

        destroyEvent.emit()

        expect(producer.isStopped).toBeTruthy() // stop() should stop producer
        expect(producer.closed).toBeFalsy() // stop() should not close producer

        expect(subscriptions[0].closed).toBeTruthy()
        expect(subscriptions[0].closed).toBeTruthy()

        done()
    })

    it('is awaitable', async (done) => {
        let producer = new StatefulProducer<number>((state) => {
            state.next(1)
        })
        let data = await producer

        producer.stop()

        expect(data).toEqual(1)

        done()
    })
})

