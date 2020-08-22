# FireRx 

FireRx extends RxJS with different useful features. Adds memory safety and garbage collection features to work with subjects 
and subscriptions, subjects that behave both like subjects and promises to support async/await and many more. 

## Custom Observable Types 
FireRx provide set of features for garbage collection like StatefulSubject acts as ReplaySubject and Promise so that you can use async/await operators on it as well as regular Subject methods. 
Adds memory safety and garbage collection automatically calling unsubscribe on subscriptions.
```typescript
import { StatefulSubject } from '@typeheim/fire-rx'

let subject = new StatefulSubject<number>()

subject.next(5)  
await subject // returns 5

subject.next(6)
await subject // returns 6

subject.stop() // completes subject and unsubscribe all subscriptions
```
[Read more about all custom observables...](docs/custom-observables.md)

## Garbage Collection
FireRx provide set of features for garbage collection, like StopOnDestroy decorator for FireRx [custom observables](custom-observables.md) that extends Angular
destructor(ngOnDestroy) or custom destructor (specified at decorator metadata) and stop specified observable.

```typescript
class WithoutDestructor {
    @StopOnDestroy()
    valueSubject = new ValueSubject(1)

    @StopOnDestroy()
    statefulSubject = new StatefulSubject()
}
```
[Read more about garbage collection...](docs/garbage-collection.md)
