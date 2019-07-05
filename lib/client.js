import { State } from './state'
import { RequestVoteRPC, RequestVoteRPCReply } from './rpc/requestVote'
import { AppendEntriesRPC, AppendEntriesRPCReply } from './rpc/appendEntries'
import { clear } from 'sisteransi';

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
        this.term_voted = false
        this.term_begin = 0
        this.timer = null
        this.debug = require('debug')(`raft:${this.id}`)
    }

    next_term() {
        ++this.state.currentTerm
        this.term_voted = false
        this.vote_cnt = 0
    }

    on_election_timeout() {
        this.become_candidate()
    }

    become_follower() {
        this.role = ROLE.Follower
        this.clear_timer()
        this.debug('become follower')
    }

    become_leader() {
        this.role = ROLE.Leader
        this.clusters.forEach(cluster => this.rpc.message(cluster, new AppendEntriesRPC))
        this.debug('become leader')
    }

    clear_timer() {
        if (this.timer) clearTimeout(this.timer)
        this.timer = setTimeout(() => this.on_timeout(), this.get_election_timeout())
    }

    on_election_end() {
        if (this.role == ROLE.Candidate) {
            if (this.vote_cnt > this.cluster_number / 2) {
                this.become_leader()
                this.vote_cnt = 0
            }
        }
    }

    become_candidate() {
        this.role = ROLE.Candidate
        this.clear_timer()
        this.next_term()
        this.debug('become candidate')
    }

    on_timeout() {
        if (this.role == ROLE.Follower || this.role == ROLE.Candidate) {
            this.timer = setTimeout(() => this.on_election_timeout(), this.get_election_timeout())
        }
    }

    on_tick() {
        if (this.role == ROLE.Candidate) {
            if (!this.term_voted) {
                this.clusters.forEach(cluster => this.rpc.message(cluster, new RequestVoteRPC(this.term, this.id)))
                this.term_voted = true
            }
        }
    }
    
    set_clusters(clusters) {
        this.cluster_number = clusters.length
        this.clusters = clusters
    }

    on_being_voted(requestVoteRPCReply) {
        if (this.role == ROLE.Candidate) {
            if (requestVoteRPCReply.voteGranted) {
                ++this.vote_cnt
            }
        }

    }

    on_vote(from, requestVoteRPC) {
        if (this.role == ROLE.Follower) {
            if (!this.term_voted) {
                this.term_voted = true
                this.rpc.message(from, new RequestVoteRPCReply(this.term, true))
            } else {
                this.rpc.message(from, new RequestVoteRPCReply(this.term, false))
            }
        }
    }

    on_append_entries(from, appendEntriesRPC) {
        if (this.role == ROLE.Candidate) {
            if (appendEntriesRPC.term >= this.state.currentTerm)
                this.become_follower()
        }
    }

    get_election_timeout() {
        return Math.random() * 150 + 150
    }

    run() {
        this.on_timeout()
    }
}
