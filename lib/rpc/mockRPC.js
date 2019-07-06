export class MockRPCService {
    constructor(cb, drop_rate, delay) {
        this.logs = []
        this.tick = 0
        this.cb = cb || (() => {})
        this.drop_rate = drop_rate || 0
        this.delay = delay || 0
        this.debug = require('debug')('raft:mockrpc')
        this.debug(`testing network with drop rate of ${drop_rate * 100}% and delay of 0-${delay}ms`)
    }

    get_client(name) {
        return new MockRPCClient(this, name)
    }

    get_time() {
        return this.tick
    }

    add_log(log) {
        if (Math.random() > this.drop_rate) {
            setTimeout(() => { if (this.cb) this.cb(log) }, Math.random() * this.delay)
        }
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
            message,
            time: this.rpc_service.get_time()
        })
    }
}
