FireRx provide set of features for garbage collection. 

## StopOnDestroy
StopOnDestroy is a special decorator for FireRx [custom observables](custom-observables.md) that extends Angular
destructor(ngOnDestroy) or custom destructor (specified at decorator metadata) and stop specified observable.
If destructor is missing in class, StopOnDestroy will attach destructor automatically.

```typescript
class WithoutDestructor {
    @StopOnDestroy()
    valueSubject = new ValueSubject(1)

    @StopOnDestroy()
    statefulSubject = new StatefulSubject()
}

class WithNgDestructor {
    @StopOnDestroy()
    valueSubject = new ValueSubject(1)

    @StopOnDestroy()
    statefulSubject = new StatefulSubject()

    ngOnDestroy() {
        //.....
    }
}

class WithCustomDestructor {
    @StopOnDestroy({ destroyHook: 'myDestructor' })
    valueSubject = new ValueSubject(1)

    @StopOnDestroy({ destroyHook: 'myDestructor' })
    statefulSubject = new StatefulSubject()

    myDestructor() {
        // ........
    }
}
```

## CompleteOnDestroy & UnsubscribeOnDestroy

Like StopOnDestroy, both CompleteOnDestroy & UnsubscribeOnDestroy are special decorators that extends Angular 
destructor(ngOnDestroy) or custom destructor (specified at decorator metadata) and call "complete" or "unsubscribe" methods 
respectively.
If destructor is missing in class, decorators will attach destructor automatically.

```typescript
class WithoutDestructor {
    @CompleteOnDestroy()
    completableSubject = new ReplaySubject()

    @UnsubscribeOnDestroy()
    unsubscribableSubject = new ReplaySubject()
}

class WithNgDestructor {
    @CompleteOnDestroy()
    completableSubject = new ReplaySubject()

    @UnsubscribeOnDestroy()
    unsubscribableSubject = new ReplaySubject()

    ngOnDestroy() {
        // ........
    }
}

class WithCustomDestructor {
    @CompleteOnDestroy({ destroyHook: 'myDestructor' })
    completableSubject = new ReplaySubject()

    @UnsubscribeOnDestroy({ destroyHook: 'myDestructor' })
    unsubscribableSubject = new ReplaySubject()

    myDestructor() {
        // ........
    }
}
```

## SubscriptionsHub

SubscriptionsHub represents a hub of subscriptions that let you unsubscribe all of the stored subscriptions at once. It might be useful to trigger
at object destruction to free up resources.

```typescript
import { SubscriptionsHub, StatefulSubject } from '@typeheim/fire-rx'

class Sample {
    protected hub: SubscriptionsHub = new SubscriptionsHub()
    
    doSomething() {
        let subject = new StatefulSubject<number>()
        
        this.hub.add(subject.subscribe(data => console.log(data)))
    }
    
    onDestroy() {
        this.hub.unsubscribe()
    }
}
```

## DestroyEvent

DestroyEvent is a special reactive class that servers as a destruction notifier and can be used in pair with Fire subjects or
with SubscriptionsHub

```typescript
import { DestroyEvent, SubscriptionsHub, StatefulSubject } from '@typeheim/fire-rx'

class Sample {
    protected destroyEvent: DestroyEvent = new DestroyEvent()
    protected hub: SubscriptionsHub = new SubscriptionsHub(this.destroyEvent)

    doSomething() {
        let subject = new StatefulSubject<number>()

        this.hub.add(subject.subscribe(data => console.log(data)))

        let anotherSubject = new StatefulSubject<number>()
        
        subject.emitUntil(this.destroyEvent)

        subject.subscribe(data => console.log(data))
    }

    onDestroy() {
        this.destroyEvent.emit()
    }
}
```
