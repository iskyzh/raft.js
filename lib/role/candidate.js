import { Client } from '../client'
import { Leader } from './leader';
import { RequestVoteRPCReply, RequestVoteRPC, AppendEntriesRPC, AppendEntriesRPCReply } from '../rpc';
import _ from 'lodash'
import { Follower } from './follower';

export class Candidate {
    constructor(client) {
        this.client = client
        this.election_timeout = client.get_timeout()
        this.begin_time = Date.now()
        this.vote_cnt = 0
        this.voter = {}
        this.type = "Candidate"
    }

    on_start() {
        ++this.client.state.currentTerm
        this.vote_for_self()
    }

    on_update() { }
    on_end() { }

    vote_for_self() {
        this.client.clusters.forEach(cluster =>
            this.client.rpc.message(cluster,
                new RequestVoteRPC(this.client.state.currentTerm, this.client.id, 0, 0)))
    }

    is_timed_out() {
        return Date.now() - this.begin_time >= this.election_timeout
    }

    is_voted_leader() {
        return this.vote_cnt > this.client.cluster_number / 2
    }

    get_next_role() {
        if (this.is_voted_leader()) return new Leader(this.client)
        if (this.is_timed_out()) return new Candidate(this.client)
        else return null
    }

    on_rpc(rpc) {
        // term low?

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

        if (rpc.message instanceof RequestVoteRPCReply) {
            if (!(rpc.sender in this.voter)) {
                this.voter[rpc.sender] = true
                if (rpc.message.voteGranted)++this.vote_cnt
            }
        }

        if (rpc.message instanceof AppendEntriesRPC) {
            // Not sure
            this.client.rpc.message(rpc.message.leaderId,
                new AppendEntriesRPCReply(this.client.state.currentTerm, false))
                if (rpc.message.term == this.client.state.currentTerm) return new Follower(this.client)
        }
        return null
    }
}
