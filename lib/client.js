import Log from './log'

export class Client {
    constructor(rpc, id) {
        this.rpc = rpc
        this.current_term = 0
        this.voted_for = null
        this.log = new Log
        this.commit_index = 0
        this.last_applied = 0
        this.next_index = []
        this.match_index = []
        this.role = 'follower'
        this.id = id
    }

    candidate_begin() {
        this.role = 'candidate'
        ++this.current_term
        this.voted_for = this.id
        this.vote_cnt = 1
        this.rpc_vote_for_self()
        this.candidate_timeout = setTimeout(
            () => {
                this.candidate_end()
                this.candidate_begin()
            },
            this.get_election_timeout() 
        )
    }

    get_election_timeout() {
        return Math.random() * 150 + 150
    }

    candidate_end() {
        clearTimeout(this.candidate_timeout)   
    }
}
