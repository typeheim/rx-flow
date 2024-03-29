import {
    DestroyEvent,
    EmitOnDestroy,
} from '..'

describe('EmitOnDestroy', () => {
    it('add destructor if it\'s missing and emit destroy event', () => {
        let withoutDestructorObj = new WithoutDestructor()

        let destructorCalled = false
        withoutDestructorObj.destroyEvent.subscribe(() => {
            destructorCalled = true
        })

        // @ts-ignore
        withoutDestructorObj.ngOnDestroy()

        expect(destructorCalled).toBeTruthy()
    })

    it('wrap destructor to emit destroy event', (done) => {
        let withDestructorObj = new WithDestructor()

        withDestructorObj.destroyEvent.subscribe(() => {
            done()
        })

        // @ts-ignore
        withDestructorObj.ngOnDestroy()

        expect(withDestructorObj.destroyed).toBeTruthy()
    })

    it('wrap custom destructor to emit destroy event', (done) => {
        let withDestructorObj = new WithCustomDestructor()

        withDestructorObj.destroyEvent.subscribe(() => {
            done()
        })

        withDestructorObj.myDestructor()

        expect(withDestructorObj.destroyed).toBeTruthy()
    })
})

class WithoutDestructor {
    @EmitOnDestroy()
    destroyEvent = new DestroyEvent()
}

class WithDestructor {
    @EmitOnDestroy()
    destroyEvent = new DestroyEvent()

    // flag to check original destructor is executed
    destroyed = false

    ngOnDestroy() {
        this.destroyed = true
    }
}

class WithCustomDestructor {
    @EmitOnDestroy({ destroyHook: 'myDestructor' })
    destroyEvent = new DestroyEvent()

    // flag to check original destructor is executed
    destroyed = false

    myDestructor() {
        this.destroyed = true
    }
}

