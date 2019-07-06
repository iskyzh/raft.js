import { Client } from './client'
import { MockRPCService } from './rpc/mockRPC'

let rpc = new MockRPCService(on_rpc)

let clients = {
    test_0: new Client(rpc.get_client('test_0'), 'test_0'),
    test_1: new Client(rpc.get_client('test_1'), 'test_1'),
    test_2: new Client(rpc.get_client('test_2'), 'test_2'),
    test_3: new Client(rpc.get_client('test_3'), 'test_3'),
    test_4: new Client(rpc.get_client('test_4'), 'test_4')
}

let clusters = ['test_0', 'test_1', 'test_2', 'test_3', 'test_4']

clients.test_0.set_clusters(clusters)
clients.test_1.set_clusters(clusters)
clients.test_2.set_clusters(clusters)
clients.test_3.set_clusters(clusters)
clients.test_4.set_clusters(clusters)

clients.test_0.run()
clients.test_1.run()
clients.test_2.run()
clients.test_3.run()
clients.test_4.run()

setInterval(() => {
    clients.test_0.on_update()
    clients.test_1.on_update()
    clients.test_2.on_update()
    clients.test_3.on_update()
    clients.test_4.on_update()
}, 1)

const debug = require('debug')('raft:main')

const drop_rate = 0.3
const delay = 50

debug(`testing network with drop rate of ${drop_rate} and delay of ${delay}`)
function on_rpc(rpc) {
    if (Math.random() > drop_rate) {
        setTimeout(() => clients[rpc.to].on_rpc(rpc), Math.random() * delay + 5)
    }
}
