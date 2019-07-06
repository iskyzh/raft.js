export class AppendEntriesRPC {
    constructor(term, leaderId, prevLogIndex, prevLogTerm, entries, leaderCommit) {
        this.term = term || 0
        this.leaderId = leaderId || 0
        this.prevLogIndex = prevLogIndex || 0
        this.prevLogTerm = prevLogTerm || 0
        this.entries = entries || []
        this.leaderCommit = leaderCommit || 0

        this.type = "appendEntries"
    }
}

export class AppendEntriesRPCReply {
    constructor(term, success, prevLogIndex) {
        this.term = term || 0
        this.success = success || false
        this.prevLogIndex = prevLogIndex || 0
        this.type = "appendEntriesReply"
    }
}
