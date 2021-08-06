/**
 * Internal metadata storage for decorators
 */
const DestructorDecoratorsMetadataMap = new WeakMap<any, DestructorDecoratorsMetadata>()

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

    return attachDestroyHook(metadata, 'emit')
}

/**
 * Stop subjects or streams when destructor specified at metadata param is triggered.
 * By default Angular "ngOnDestroy" destructor is used.
 *
 * @deprecated please use {@link CompleteOnDestroy} instead
 */
export function StopOnDestroy(metadata?: DestroyHookMetadata): PropertyDecorator {
    return attachDestroyHook(metadata, 'complete')
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

        let destroyQueue: DestructorDecoratorsMetadata
        let decoratorIsWrapped = true
        if (!DestructorDecoratorsMetadataMap.has(target.constructor)) {
            DestructorDecoratorsMetadataMap.set(target.constructor, {
                stop: [],
                complete: [],
                unsubscribe: [],
                emit: [],
            })
            decoratorIsWrapped = false
        }

        destroyQueue = DestructorDecoratorsMetadataMap.get(target.constructor)
        // push property to destroy queue if it wasn't before
        if (!destroyQueue[destroyType].includes(propertyKey)) {
            destroyQueue[destroyType].push(propertyKey)
        }

        if (decoratorIsWrapped) {
            // prevent wrapping decorator multiple times
            return
        }

        if (!target.hasOwnProperty(hookName)) {
            Object.defineProperty(target.constructor.prototype, hookName, {
                value: function() {},
                configurable: true,
                writable: true,
            })
        }

        const originalDestructor = target.constructor.prototype[hookName]
        const newDestructorDescriptor = {
            value: function(...args: any[]) {
                originalDestructor ? originalDestructor.apply(this, args) : null
                const hooksMetadata = DestructorDecoratorsMetadataMap.get(this.constructor)

                for (let destroyType in hooksMetadata) {

                    hooksMetadata[destroyType]?.forEach(property => {
                        try {
                            if (this?.[property]?.[destroyType]) {
                                this[property][destroyType]()
                            }
                        } catch (error) {
                            let capitalizedType = config.type.charAt(0).toUpperCase() + config.type.slice(1)
                            console.log(`Error at ${capitalizedType}OnDestroy:`, error)
                        }
                    })
                }

            },
            configurable: true,
            writeable: true,
        }

        // Deleting old destructor and injecting wrapped one
        delete target.constructor.prototype[hookName]
        Object.defineProperty(target.constructor.prototype, hookName, newDestructorDescriptor)
    }
}


interface DestructorDecoratorsMetadata {
    stop: [],
    complete: [],
    unsubscribe: [],
    emit: [],
}

export interface DestroyHookMetadata {
    destroyHook: string
}
