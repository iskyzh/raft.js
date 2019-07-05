import { Client } from '../client'
import _ from 'lodash'
import { RequestVoteRPC, RequestVoteRPCReply, AppendEntriesRPC } from '../rpc';
import { MockRPCService } from '../rpc/mockRPC';
import { Leader } from './leader';

function make_other_client(name) {
    return `test${name}`
}

function make_client(rpc) {
    let client = new Client(rpc)
    client.set_clusters(_.map(_.range(5), d => make_other_client(d)))
    return client
}

test('should send heartbeat', () => {
    let rpc = new MockRPCService
    let client = make_client(rpc.get_client('test0'))
    let leader = new Leader(client)

    leader.on_update()

    expect(_.some(rpc.logs, log => log.message instanceof AppendEntriesRPC)).toBe(true)
})
