import {
    LazyLoadStream,
    ValueSubject,
} from '../index'

describe('LazyLoadStream', () => {
    it('can push data to subscriptions', async (done) => {
        let isStreamInitialized = false
        let stream = new LazyLoadStream<number>(() => {
            isStreamInitialized = true
            return new ValueSubject(1)
        })

        // after creation stream should not be initialized
        expect(isStreamInitialized).toBeFalsy()

        stream.subscribe(data => data)


        // after creation stream should not be initialized
        expect(isStreamInitialized).toBeTruthy()


        done()
    })


    it('is awaitable', async (done) => {
        let stream = new LazyLoadStream<number>(() => {
            return new ValueSubject(1)
        })
        let data = await stream

        expect(data).toEqual(1)

        done()
    })
})

