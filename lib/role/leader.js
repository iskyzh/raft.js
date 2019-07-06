import { Client } from '../client'
import { AppendEntriesRPC, RequestVoteRPC, AppendEntriesRPCReply, RequestVoteRPCReply } from '../rpc';
import { Follower } from './follower';

export class Leader {
    constructor(client) {
        this.client = client
        this.last_sync = 0
        this.type = "Leader"
        this.next_index = {}
        this.match_index = {}

        this._debug_append_entry = 0
    }

    sync_log() {
        this.client.clusters.forEach(cluster => {
            if (this.client.state.log.length > this.next_index[cluster]) {

            } else {
                // heartbeat
                this.client.rpc.message(cluster,
                    new AppendEntriesRPC(this.client.state.currentTerm, 
                        this.client.id, 
                        0, 0, 0))
            }
        })
    }

    on_rpc(rpc) {
        if (rpc.message.term > this.client.state.currentTerm) {
            this.client.state.currentTerm = rpc.message.term

            if (rpc.message instanceof RequestVoteRPC) {
                this.client.rpc.message(rpc.message.candidateID,
                    new RequestVoteRPCReply(this.client.state.currentTerm, false))
            }

            if (rpc.message instanceof AppendEntriesRPC) {
                this.client.rpc.message(rpc.message.leaderId,
                    new AppendEntriesRPCReply(this.client.state.currentTerm, false))
            }

            return new Follower(this.client)
        }

        return null
    }

    on_start() {
        this.client.clusters.forEach(cluster => {
            this.next_index[cluster] = this.client.state.log.length
            this.match_index[cluster] = 0
        })
    }

    on_end() { }

    on_update() {
        if (Date.now() > this.last_sync + 5) {
            this.last_sync = Date.now()
            this.sync_log()
        }

        if (Date.now() > this._debug_append_entry + 100) {
            this._debug_append_entry = Date.now()
            this.append_entry(parseInt(Math.random() * 100))
        }
    }

    append_entry(entry) {
        this.client.state.log.push(entry)
    }

    get_next_role() {
        return null
    }
}
