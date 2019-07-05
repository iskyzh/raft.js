export class RequestVoteRPC {
    constructor(term, candidateID, lastLogIndex, lastLogTerm) {
        this.term = term || 0
        this.candidateID = candidateID || 0
        this.lastLogIndex = lastLogIndex || 0
        this.lastLogTerm = lastLogTerm || 0
        this.type = "requestVote"
    }
}

export class RequestVoteRPCReply {
    constructor(term, voteGranted) {
        this.term = term || 0
        this.voteGranted = voteGranted || false
        this.type = "requestVoteReply"
    }
}
