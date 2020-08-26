/**
 * Emit DestroyEvent when destructor specified at metadata param is triggered.
 * By default Angular "ngOnDestroy" destructor is used.
 */
export function EmitOnDestroy(metadata?: DestroyHookMetadata): PropertyDecorator {
    if (!metadata || !metadata?.destroyHook) {
        metadata = {
            destroyHook: 'ngOnDestroy',
        }
    }

    return (target: Object, propertyKey: string | symbol) => {
        if (!target.hasOwnProperty(metadata.destroyHook)) {
            target[metadata.destroyHook] = function() {}
        }

        const originalOnDestroy = target[metadata.destroyHook]
        target[metadata.destroyHook] = function(...args): void {
            try {
                this[propertyKey].emit()
            } catch (error) {
                console.log(`@EmitOnDestroy[ERROR]`, error)
            }

            return originalOnDestroy.apply(this, args)
        }
    }
}

/**
 * Stop subjects or streams when destructor specified at metadata param is triggered.
 * By default Angular "ngOnDestroy" destructor is used.
 */
export function StopOnDestroy(metadata?: DestroyHookMetadata): PropertyDecorator {
    return attachDestroyHook(metadata, 'stop')
}

/**
 * Complete subjects, observables or streams when destructor specified at metadata param is triggered.
 * By default Angular "ngOnDestroy" destructor is used.
 */
export function CompleteOnDestroy(metadata?: DestroyHookMetadata): PropertyDecorator {
    return attachDestroyHook(metadata, 'complete')
}

/**
 * Unsubscribes subjects, observables or streams when destructor specified at metadata param is triggered.
 * By default Angular "ngOnDestroy" destructor is used.
 */
export function UnsubscribeOnDestroy(metadata?: DestroyHookMetadata): PropertyDecorator {
    return attachDestroyHook(metadata, 'unsubscribe')
}

function attachDestroyHook(metadata, destroyType) {
    let config = {
        destroyHook: metadata?.destroyHook ?? 'ngOnDestroy',
        type: destroyType,
    }

    return (target: Object, propertyKey: string | symbol) => {
        const hookName = config.destroyHook
        const queueProperty = `__fireRxQueue`

        if (!target.hasOwnProperty(queueProperty)) {
            target[queueProperty] = {}
            target[queueProperty][config.type] = []
        } else if (!target[queueProperty][config.type]) {
            target[queueProperty][config.type] = []
        }
        if (!target.hasOwnProperty(hookName)) {
            target[hookName] = function() {}
        }
        target[queueProperty][config.type].push(propertyKey)

        // prevent wrapping destructor several times
        const patchFlag = `__hookPatchedByFireRx`
        if (target[hookName][patchFlag]) {
            return
        }

        const originalOnDestroy = target[hookName]
        target[hookName] = function(...args): void {
            try {
                for (let queueType in this[queueProperty]) {
                    this[queueProperty][queueType].forEach(name => {
                        this[name][queueType]()
                    })
                }
            } catch (error) {
                let capitalizedType = config.type.charAt(0).toUpperCase() + config.type.slice(1)
                console.log(`Error at ${capitalizedType}OnDestroy:`, error)
            }

            return originalOnDestroy.apply(this, args)
        }
        target[hookName][patchFlag] = true
    }
}

export interface DestroyHookMetadata {
    destroyHook: string
}
