# RxFlow

Collection of reactive libraries to ease your life
<p>
    <a href="https://www.npmjs.com/package/@typeheim/fire-rx" target="_blank"><img src="https://img.shields.io/npm/v/@typeheim/fire-rx.svg" alt="NPM Version" /></a>
    <a href="https://www.npmjs.com/package/@typeheim/fire-rx" target="_blank"><img src="https://img.shields.io/npm/l/@typeheim/fire-rx.svg" alt="Package License" /></a>
    <a href="https://discord.gg/dmMznp9" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
</p>

# FireRx 

FireRx extends RxJS with different useful features. Adds memory safety and garbage collection features to work with subjects 
and subscriptions, subjects that behave both like subjects and promises to support async/await and many more.

# Getting Started
Install package
```shell
yarn add @typeheim/fire-rx
//or
npm -i @typeheim/fire-rx
```

## Custom Obsevrables

FireRx adds custom observable types, like StatefulSubject that acts as ReplaySubject and Promise so that you can use async/await operators on it as well as regular Subject methods. 
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

FireRx provide set of features for garbage collection, like StopOnDestroy decorator for FireRx custom observables that extends Angular
destructor(ngOnDestroy) or custom destructor (specified at decorator metadata) and stop specified observable.

```typescript
class WithoutDestructor {
    @StopOnDestroy()
    valueSubject = new ValueSubject(1)

    @StopOnDestroy()
    statefulSubject = new StatefulSubject()
}
```
[Read more about FireRx...](packages/fire-rx/README.md)
