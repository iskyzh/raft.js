export class AppendEntriesRPC {
    constructor(term, leaderId, prevLogIndex, entries, leaderCommit) {
        this.term = term || 0
        this.leaderId = leaderId || 0
        this.prevLogIndex = prevLogIndex || 0
        this.entries = entries || []
        this.leaderCommit = leaderCommit || 0

        this.type = "appendEntries"
    }
}

export class AppendEntriesRPCReply {
    constructor() {
        this.term = 0
        this.success = 0

        this.type = "appendEntriesReply"
    }
}
