import { State } from './state'
import { RequestVoteRPC, RequestVoteRPCReply, AppendEntriesRPC, AppendEntriesRPCReply } from './rpc'
import { Follower, Candidate, Leader } from './role'

export class Client {
    constructor(rpc, id) {
        this.role = new Follower(this)
        this.state = new State
        this.rpc = rpc
        this.id = id
        this.cluster_number = 0
        this.clusters = []
        this.debug = require('debug')(`raft:${this.id}`)
    }

    set_clusters(clusters) {
        this.cluster_number = clusters.length
        this.clusters = clusters
    }

    get_timeout() {
        return Math.random() * 150 + 150
    }

    switch_role(next_role) {
        this.role.on_end()
        let prev_role_name = this.role.type
        this.role = next_role
        this.role.on_start()
        let next_role_name = this.role.type
        if (prev_role_name != next_role_name) this.debug(`${this.id}@${this.state.currentTerm} ${prev_role_name} -> ${next_role_name}`)
    }

    on_update() {
        let next_role = this.role.get_next_role()
        if (next_role) this.switch_role(next_role)
        this.role.on_update()
    }

    on_rpc(rpc) {
        if (rpc.message.term > this.state.currentTerm) {
            // TODO: check how to modify term number
            this.state.currentTerm = rpc.message.term
            this.switch_role(new Follower(this))
            this.role.on_update()
        } else {
            let new_role = this.role.on_rpc(rpc)
            if (new_role) {
                this.switch_role(new_role)
                this.role.on_update()
                this.role.on_rpc(rpc)
            }
            // TODO: multiple switch of role
        }
    }

    run() {
        this.role.on_start()
    }
}
