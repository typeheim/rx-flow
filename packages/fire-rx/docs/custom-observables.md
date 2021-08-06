FireRx extend RxJS with custom Observable types.

## StatefulSubject

StatefulSubject acts as ReplaySubject and Promise so that you can use async/await operators on it as well as regular Subject methods. 
Adds memory safety and garbage collection automatically calling unsubscribe on subscriptions.

```typescript
import { StatefulSubject } from '@typeheim/fire-rx'

let subject = new StatefulSubject<number>()

subject.next(5)  
await subject // returns 5

subject.next(6)
await subject // returns 6

subject.complete() // completes subject and unsubscribe all subscriptions
```

## StatefulStream
StatefulStream works similarly to StatefulSubject but with main difference that it can accept data only from
data provider passed to constructor. 

```typescript
import { StatefulStream } from '@typeheim/fire-rx'

let stream = new StatefulStream<number>((context) => {
    dataSource.onData(data => context.next(data))
})

let data = await stream

stream.subscribe(data => /.../)

stream.complete() // completes producer and unsubscribe all subscriptions
```

## ValueSubject

ValueSubject extends BehaviorSubject from RxJS and adds memory safety, garbage collection and Promise interface so that you can use async/await operators on it.

```typescript
import { ValueSubject } from '@typeheim/fire-rx'

let subject = new ValueSubject<number>(0)

subject.next(5)
await subject // returns 5

subject.next(6)
await subject // returns 6

subject.complete() // completes subject and unsubscribe all subscriptions
```

## ReactivePromise
ReactivePromise acts as a regular Promise but additionally let you use `subscribe` and `pipe` methods. ReactivePromise, like 
StatefulSubject, buffers resolved value and can distribute it to multiple subscribers. 
ReactivePromise is memory-safe and unsubscribe subscriptions once it's resolved. 

```typescript
import { ReactivePromise } from '@typeheim/fire-rx'

let promise = new ReactivePromise<number>()

promise.resolve(5)
await promise // returns 5
promise.subscribe(value => console.log(value)) // returns 5 

//..............

let promise = new ReactivePromise<number>((state) => {
    state.resolve(5)
})

promise.subscribe(value => console.log(value)) // returns 5 
```

ReactivePromise can be automatically triggered using `resolveOn` hook
```typescript
let event = new DestroyEvent()
let promise = new ReactivePromise<number>()

promise.subscribe(value => {/*....*/})

promise.resolveOn(event, 5)
```

