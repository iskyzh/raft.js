export class State {
    constructor() {
        this.currentTerm = 0
        this.votedFor = 0
        this.log = []

        this.commitIndex = 0
        this.lastApplied = 0

        this.nextIndex = []
        this.matchIndex = []
    }
}
