export class AppendEntriesRPC {
    constructor() {
        this.term = 0
        this.leaderId = 0
        this.prevLogInedx = 0
        this.entries = []
        this.leaderCommit = 0

        this.term = 0
        this.success = 0
    }
}
