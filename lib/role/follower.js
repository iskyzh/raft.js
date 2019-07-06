import { Client } from '../client'
import { Candidate } from './candidate'
import { RequestVoteRPC, RequestVoteRPCReply, AppendEntriesRPC, AppendEntriesRPCReply } from '../rpc';

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
        if (rpc.message.term > this.client.state.currentTerm) {
            this.client.state.currentTerm = rpc.message.term
        }

        this.begin_time = Date.now()

        if (rpc.message instanceof RequestVoteRPC) {
            let do_vote = this.term_voted == null || this.term_voted == rpc.message.candidateID
            do_vote = do_vote && rpc.message.term == this.client.state.currentTerm
            // TODO: check log status
            this.client.rpc.message(rpc.message.candidateID,
                new RequestVoteRPCReply(this.client.state.currentTerm, do_vote))
            this.term_voted = rpc.message.candidateID
        }

        if (rpc.message instanceof AppendEntriesRPC) {
            let do_append = rpc.message.term == this.client.state.currentTerm
            this.client.rpc.message(rpc.message.leaderId,
                new AppendEntriesRPCReply(this.client.state.currentTerm, do_append))
            if (do_append) {
                // TODO: check (receiver implementation)
                if (rpc.message.prevLogIndex >= this.client.state.log.length - 1) {
                    if (rpc.message.prevLogIndex == this.client.state.log.length - 1)
                    this.client.state.append_log({ entry: rpc.message.entries, term: this.client.state.currentTerm })
                    this.client.rpc.message(rpc.message.leaderId, new AppendEntriesRPCReply(this.client.state.currentTerm, true, rpc.message.prevLogIndex))
                }
                // TODO: should reply if already in log?
            }
        }
        return null
    }

    on_update() { }
    on_start() { }
    on_end() { }
}
