export class State {
    constructor() {
        this.currentTerm = 0
        this.log = []

        this.commitIndex = 0
        this.lastApplied = 0
    }
}
