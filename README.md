# Rx Flow

Collection of reactive libraries to ease your life.

# FireRx 

RxJS on steroids. Adds memory safety and garbage collection features to work with subjects and subscriptions. 
Adds subjects that behave both like subjects and promises to support async/await. 

# Getting Started
Install package
```shell
yarn add @typeheim/fire-rx
//or
npm -i @typeheim/fire-rx
```

## StatefulSubject
StatefulSubject acts as ReplaySubject and Promise so that you can use async/await operators on it as well as regular Subject methods.
Adds memory safety and garbage collection automatically calling unsubscribe on subscriptions.
```typescript
import { StatefulSubject } from '@typeheim/fire-rx'

let subject = new StatefulSubject<number>(1)

subject.next(5)  
await subject // returns 5

subject.next(6)
await subject // returns 6

subject.stop() // completes subject and unsubscribe all subscriptions
```
[Read more...](packages/fire-rx/README.md)
