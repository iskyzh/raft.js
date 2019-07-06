export class AppendEntriesRPC {
    constructor(term, leaderId, prevLogIndex, prevLogTerm, entries, leaderCommit) {
        this.term = term || 0
        this.leaderId = leaderId || 0
        this.prevLogIndex = prevLogIndex || 0
        this.prevLogTerm = prevLogTerm || 0
        this.entries = entries || []
        this.leaderCommit = leaderCommit || 0
    }
}

export class AppendEntriesRPCResult {
    constructor(term, success) {
        this.term = term || 0
        this.success = success || false
    }
}

export class RequestVoteRPC {
    constructor(term, candidateID, lastLogIndex, lastLogTerm) {
        this.term = term || 0
        this.candidateID = candidateID || 0
        this.lastLogIndex = lastLogIndex || 0
        this.lastLogTerm = lastLogTerm || 0
    }
}

export class RequestVoteRPCResult {
    constructor(term, voteGranted) {
        this.term = term || 0
        this.voteGranted = voteGranted || false
    }
}

export class MockRPC {
    constructor(drop_rate, delay) {
        this.clients = {}
        this.drop_rate = drop_rate || 0
        this.delay = delay || 0
    }

    get_client(name, on_rpc) {
        const client = new MockRPCClient(this, name, on_rpc)
        this.clients[name] = client
        return client
    }

    call_rpc(from, to, rpc) {
        return new Promise((resolve, reject) => {
            if (Math.random() < this.drop_rate) reject()
            else setInterval(() => {
                resolve(this.clients[to].on_rpc(from, rpc))
            }, this.delay)
        })
    }
}

export class MockRPCClient {
    constructor(rpc, name, on_rpc) {
        this.rpc = rpc
        this.name = name
        this.on_rpc = on_rpc
    }

    call_rpc(to, rpc) {
        return this.rpc.call_rpc(this.name, to, rpc)
    }
}
