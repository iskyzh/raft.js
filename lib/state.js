export class State {
    constructor(client) {
        this.currentTerm = 0
        this.log = []

        this.commitIndex = 0
        this.lastApplied = 0

        this.debug = client.debug
    }

    append_log(log) {
        if (!log.entry) return
        this.log.push(log)
    }
}
