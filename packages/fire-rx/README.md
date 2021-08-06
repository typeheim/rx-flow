# FireRx 

FireRx extends RxJS with different useful features. Adds memory safety and garbage collection features to work with subjects 
and subscriptions, subjects that behave both like subjects and promises to support async/await and many more. 
<p>
    <a href="https://www.npmjs.com/package/@typeheim/fire-rx" target="_blank"><img src="https://img.shields.io/npm/v/@typeheim/fire-rx.svg" alt="NPM Version" /></a>
    <a href="https://travis-ci.org/github/typeheim/rx-flow" target="_blank"><img src="https://travis-ci.org/typeheim/rx-flow.svg?branch=master" alt="Build Status" /></a>
    <a href="https://www.npmjs.com/package/@typeheim/fire-rx" target="_blank"><img src="https://img.shields.io/npm/l/@typeheim/fire-rx.svg" alt="Package License" /></a>
    <a href="https://discord.gg/dmMznp9" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
</p>

# Getting Started

Install package

```shell
yarn add @typeheim/fire-rx
//or
npm -i @typeheim/fire-rx
```

# Overview

FireRx consist of custom Observable types and additional features to work with observables.

## Custom Observable Types 

FireRx adds custom observable types, like StatefulSubject that acts as ReplaySubject and Promise so that you can use async/await operators on it as well as regular Subject methods. 
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
