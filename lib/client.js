import { State } from './state'

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
        this.cluster_number = 5
        this.vote_cnt = 0
    }

    on_election_timeout() {
        this.begin_election()
    }

    on_election_end() {
        if (this.vote_cnt > this.cluster_number / 2) {
            this.role = ROLE.Leader
        }
    }

    begin_election() {
        this.role = ROLE.Candidate
        ++this.state.currentTerm
        this.vote_cnt = 0
    }

    on_tick() {
        if (this.role == ROLE.Candidate) {
            this.rpc.message(`vote for ${this.id}`)
        }
    }
    
    set_cluster_number(number) {
        this.cluster_number = number
    }

    on_being_voted(requestVoteRPCReply) {
        if (requestVoteRPCReply.voteGranted) {
            ++this.vote_cnt
        }
    }
}
