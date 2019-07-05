import { Client } from '../client'
import { Candidate } from './candidate'
import { RequestVoteRPC, RequestVoteRPCReply } from '../rpc';

export class Follower {
    constructor(client) {
        this.client = client
        this.follower_timeout = client.get_timeout()
        this.begin_time = Date.now()
        this.term_voted = null
        this.type = "Follower"
    }

    is_timed_out() {
        return Date.now() - this.begin_time >= this.follower_timeout
    }

    get_next_role() {
        if (this.is_timed_out()) return new Candidate(this.client)
        else return null
    }

    on_rpc(rpc) {
        this.begin_time = Date.now()
        if (rpc.message instanceof RequestVoteRPC) {
            this.client.rpc.message(rpc.message.candidateID, 
                new RequestVoteRPCReply(this.client.state.currentTerm, 
                    this.term_voted == null || 
                    this.term_voted == rpc.message.candidateID))
            this.term_voted = rpc.message.candidateID
        }
        return null
    }

    on_update() { }
    on_start() { }
    on_end() { }
}
