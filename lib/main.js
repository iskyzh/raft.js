import { Client } from './client'
import { MockRPCService } from './rpc/mockRPC'
import { Leader, Follower } from './role'
import _ from 'lodash'

let rpc = new MockRPCService(on_rpc, 0.3, 50)

let clients = {
    test_0: new Client(rpc.get_client('test_0'), 'test_0'),
    test_1: new Client(rpc.get_client('test_1'), 'test_1'),
    test_2: new Client(rpc.get_client('test_2'), 'test_2'),
    test_3: new Client(rpc.get_client('test_3'), 'test_3'),
    test_4: new Client(rpc.get_client('test_4'), 'test_4')
}

let clusters = ['test_0', 'test_1', 'test_2', 'test_3', 'test_4']

_.forIn(clients, (client, cluster) => {
    client.set_clusters(_.filter(clusters, _cluster => _cluster != cluster))
})

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

setInterval(() => {
    _.forIn(clients, (client, cluster) => {
        if (client.role instanceof Leader) {
            client.role.append_entry(Math.random() * 100)
            client.debug(client.state.log)
        }
        if (client.role instanceof Follower) {
            client.debug(client.state.log)
        }
    })
}, 1000)

const debug = require('debug')('raft:main')

function on_rpc(rpc) {
    clients[rpc.to].on_rpc(rpc)
}
