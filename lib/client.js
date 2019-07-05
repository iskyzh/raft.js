import { State } from './state'
import { RequestVoteRPC, RequestVoteRPCReply, AppendEntriesRPC, AppendEntriesRPCReply } from './rpc'
import { Follower, Candidate, Leader } from './role'

export class Client {
    constructor(rpc, id) {
        this.role = new Follower
        this.state = new State
        this.rpc = rpc
        this.id = id
        this.cluster_number = 0
        this.clusters = []
        this.debug = require('debug')(`raft:${this.id}`)
    }
}
