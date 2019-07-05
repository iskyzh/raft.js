export class MockRPCService {
    constructor() {
        this.logs = []
        this.tick = 0
    }

    get_client(name) {
        return new MockRPCClient(this, name)
    }

    get_time() {
        return this.tick
    }
}

export class MockRPCClient {
    constructor(rpc_service, name) {
        this.rpc_service = rpc_service
        this.name = name
    }

    message(message) {
        this.rpc_service.logs.push({
            sender: this.name,
            tick: this.rpc_service.tick,
            message
        })
    }
}
