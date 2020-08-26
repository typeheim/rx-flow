import {
    ReactivePromise,
    DestroyEvent,
} from '..'
import { ReplaySubject } from 'rxjs'
import {
    takeUntil,
    map,
} from 'rxjs/operators'

describe('ReactivePromise', () => {
    it('can return value multiple times as promise', async (done) => {
        let promise = new ReactivePromise<number>()

        promise.resolve(5)

        expect(await promise).toEqual(5)
        expect(await promise).toEqual(5)
        expect(await promise).toEqual(5)
        expect(await promise).toEqual(5)

        done()
    })

    it('can be used with takeUntil operator', async (done) => {
        let subject = new ReplaySubject(1)
        let promise = new ReactivePromise<number>()

        subject.pipe(takeUntil(promise)).subscribe({
            complete: () => {
                expect(true).toBeTruthy()
                done()
            },
        })

        promise.resolve(1)
    })

    it('can be used with operators', async (done) => {
        let promise = new ReactivePromise()

        promise.pipe(map((data) => 'value')).subscribe((data) => {
            expect(data).toEqual('value')
            done()
        })

        promise.resolve({ name: 'ddd' })
    })

    it('can return value multiple times through subscriptions', async (done) => {
        let promise = new ReactivePromise<number>()

        promise.resolve(5)

        promise.subscribe(value => {
            expect(value).toEqual(5)
            promise.subscribe(value => {
                expect(value).toEqual(5)

                done()
            })
        })

        done()
    })

    it('must unsubscribe subscriptions after resolving', async (done) => {
        let promise = new ReactivePromise<number>()

        let sub1 = promise.subscribe(value => {})
        let sub2 = promise.subscribe(value => {})
        let sub3 = promise.subscribe(value => {})

        promise.resolve(5)

        // subscriptions must be closed
        expect(sub1.closed).toBeTruthy()
        expect(sub2.closed).toBeTruthy()
        expect(sub3.closed).toBeTruthy()

        done()
    })

    it('resolves when event passed to resolveOn', async (done) => {
        let event = new DestroyEvent()
        let promise = new ReactivePromise<number>()

        promise.subscribe(value => {
            expect(value).toEqual(5)

            done()
        })

        promise.resolveOn({
            event,
            value: 5,
        })

        event.emit()
    })
})
