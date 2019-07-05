export class MockRPCService {
    constructor(cb) {
        this.logs = []
        this.tick = 0
        this.cb = cb || (() => {})
    }

    get_client(name) {
        return new MockRPCClient(this, name)
    }

    get_time() {
        return this.tick
    }

    add_log(log) {
        if (this.cb) this.cb(log)
        this.logs.push(log)
    }
}

export class MockRPCClient {
    constructor(rpc_service, name) {
        this.rpc_service = rpc_service
        this.name = name
    }

    message(to, message) {
        this.rpc_service.add_log({
            sender: this.name,
            to,
            tick: this.rpc_service.tick,
            message
        })
    }
}
