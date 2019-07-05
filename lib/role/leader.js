import { Client } from '../client'
import { AppendEntriesRPC } from '../rpc';

export class Leader {
    constructor(client) {
        this.client = client
        this.last_heartbeat = 0
        this.type = "Leader"
    }

    send_heartbeat() {
        this.client.clusters.forEach(cluster =>
            this.client.rpc.message(cluster,
                new AppendEntriesRPC(this.client.state.currentTerm, this.client.id, 0, 0, 0)))
    }

    on_rpc(rpc) {
        return null
    }

    on_start() { }
    on_end() { }
    on_update() {
        if (Date.now() > this.last_heartbeat + 10) {
            this.last_heartbeat = Date.now()
            this.send_heartbeat()
        }
    }

    get_next_role() {
        return null
    }
}
