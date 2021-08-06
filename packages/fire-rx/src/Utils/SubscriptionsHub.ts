import { DestroyEvent } from '../Observables/DestroyEvent'
import {
    TeardownLogic,
    Unsubscribable,
} from 'rxjs'

/**
 * @deprecated will be removed in next release
 */
export class SubscriptionsHub {
    protected subscriptions = []

    constructor(destroyEvent?: DestroyEvent) {
        if (destroyEvent) {
            this.collectUntil(destroyEvent)
        }
    }

    get count() {
        return this.subscriptions.length
    }

    collectUntil(destroyEvent: DestroyEvent) {
        destroyEvent.subscribe(() => { this.unsubscribe() })
    }

    add(subscription: Unsubscribable | TeardownLogic) {
        this.subscriptions.push(subscription)
    }

    unsubscribe() {
        this.subscriptions.forEach(subscription => {
            // additional verification to ensure valid subscription passed
            if (subscription['unsubscribe'] === undefined) { return }

            if (subscription['closed'] !== undefined && !subscription['closed']) {
                // if subscription is closed we should mot unsubscribe
                subscription.unsubscribe()
            } else if (subscription['closed'] === undefined) {
                // if for some reason `closed` isn't defined we still unsubscribe
                // @todo - figure out a better way to prevent duplication
                subscription.unsubscribe()
            }
        })
        this.subscriptions = []
    }
}
