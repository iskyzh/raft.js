import { Client } from '../client'
import _ from 'lodash'
import { AppendEntriesRPC, AppendEntriesRPCReply } from '../rpc';
import { MockRPCService } from '../rpc/mockRPC';
import { Leader } from './leader';
import { Follower } from './follower';

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

test('should fallback to follower if higher term is discovered', () => {
    let rpc = new MockRPCService
    let client = make_client(rpc.get_client('test0'))
    let leader = new Leader(client)

    expect(leader.on_rpc({ message: new AppendEntriesRPC(100)} )).toBeInstanceOf(Follower)
})

test('should send entry', () => {
    let rpc = new MockRPCService
    let client = make_client(rpc.get_client('leader'))
    let leader = new Leader(client)

    leader.on_start()
    leader.append_entry(23333)
    leader.on_update()

    expect(_.some(rpc.logs, log => {
        if (log.message instanceof AppendEntriesRPC) {
            if (log.message.entries == 23333) {
                return true
            }
        }
        return false
    })).toBe(true)
})

test('should not send entry if succeed', () => {
    let rpc = new MockRPCService
    let client = make_client(rpc.get_client('leader'))
    let leader = new Leader(client)

    leader.on_start()
    leader.append_entry(23333)
    leader.request_sync()
    rpc.logs = []
    leader.on_rpc({ sender: 'test0', message: new AppendEntriesRPCReply(leader.client.state.currentTerm, true) })
    leader.request_sync()
    expect(_.some(rpc.logs, log => {
        if (log.message instanceof AppendEntriesRPC) {
            if (log.message.to == 'test0' && log.message.entries == 23333) {
                return true
            }
        }
        return false
    })).toBe(false)
})
