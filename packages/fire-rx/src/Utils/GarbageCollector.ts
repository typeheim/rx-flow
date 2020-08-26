/**
 * Rx subjects garbage collector
 */
export class GarbageCollector {
    protected subjects = []

    addSubject(subject) {
        this.subjects.push(subject)
    }

    clean() {
        this.subjects.forEach(subject => {
            subject.stop()
        })
        this.subjects = []
    }
}
