import { Client } from './client'
import { MockRPCService } from './rpc/mockRPC'

let rpc = new MockRPCService(on_rpc)

let clients = {
    test0: new Client(rpc.get_client('test_0'), 'test_0'),
    test1: new Client(rpc.get_client('test_1'), 'test_1'),
    test2: new Client(rpc.get_client('test_2'), 'test_2'),
    test3: new Client(rpc.get_client('test_3'), 'test_3'),
    test4: new Client(rpc.get_client('test_4'), 'test_4')
}

let clusters = ['test0', 'test1', 'test2', 'test3', 'test4']

clients.test0.set_clusters(clusters)
clients.test1.set_clusters(clusters)
clients.test2.set_clusters(clusters)
clients.test3.set_clusters(clusters)
clients.test4.set_clusters(clusters)

clients.test0.run()
clients.test1.run()
clients.test2.run()
clients.test3.run()
clients.test4.run()

setInterval(() => {
    clients.test0.on_tick()
    clients.test1.on_tick()
    clients.test2.on_tick()
    clients.test3.on_tick()
    clients.test4.on_tick()
}, 50)

const debug = require('debug')('raft:main')

function on_rpc(rpc) { 
    debug(rpc) 
    if (rpc.type == 'requestVote') {
        clients[rpc.to].on_vote(rpc.sender, rpc.message)
    }
    if (rpc.type == 'requestVoteReply') {
        clients[rpc.to].on_being_voted(rpc.sender, rpc.message)
    }
}
