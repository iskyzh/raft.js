import { State } from './state'
import { RequestVoteRPC, RequestVoteRPCReply } from './rpc/requestVote'
import { AppendEntriesRPC, AppendEntriesRPCReply } from './rpc/appendEntries'

export const ROLE = {
    Follower: "follower",
    Candidate: "candidate",
    Leader: "leader"
}

export class Client {
    constructor(rpc, id) {
        this.role = ROLE.Follower
        this.state = new State
        this.rpc = rpc
        this.id = id
        this.cluster_number = 0
        this.clusters = []
        this.vote_cnt = 0
    }

    on_election_timeout() {
        this.begin_election()
    }

    become_follower() {
        this.role = ROLE.Follower
    }

    become_leader() {
        this.role = ROLE.Leader
        this.clusters.forEach(cluster => this.rpc.message(cluster, new AppendEntriesRPC))
    }

    on_election_end() {
        if (this.vote_cnt > this.cluster_number / 2) {
            this.become_leader()
            this.vote_cnt = 0
        }
    }

    begin_election() {
        this.role = ROLE.Candidate
        this.vote_cnt = 0
        ++this.state.currentTerm
        this.vote_cnt = 0
    }

    on_tick() {
        if (this.role == ROLE.Candidate) {
            this.clusters.forEach(cluster => this.rpc.message(cluster, new RequestVoteRPC(this.term, this.id)))
        }
    }
    
    set_clusters(clusters) {
        this.cluster_number = clusters.length
        this.clusters = clusters
    }

    on_being_voted(requestVoteRPCReply) {
        if (requestVoteRPCReply.voteGranted) {
            ++this.vote_cnt
        }
    }

    on_vote(from, requestVoteRPC) {
        this.rpc.message(from, new RequestVoteRPCReply(this.term, true))
    }

    on_append_entries() {
        if (this.role == ROLE.Candidate) this.become_follower()
    }

    on_request() {
        
    }
}
