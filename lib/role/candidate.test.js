import { Client } from '../client'
import { Candidate } from './candidate'
import _ from 'lodash'
import { RequestVoteRPCReply, RequestVoteRPC, AppendEntriesRPC } from '../rpc';
import { Leader } from './leader';
import { MockRPCService } from '../rpc/mockRPC';
import { candidate } from './candidate';
import { Follower } from './follower';

function make_other_client(name) {
    return `test${name}`
}

function make_client(rpc) {
    let client = new Client(rpc)
    client.set_clusters(_.map(_.range(5), d => make_other_client(d)))
    return client
}

test('should still be candidate if timed out', () => {
    let client = make_client()
    let candidate = new Candidate(client)
    let promise = new Promise((resolve) => setTimeout(resolve, 500))
    return expect(promise.then(() => candidate.get_next_role())).resolves.toBeInstanceOf(Candidate)
})

test('should not do anything if not timed out', () => {
    let client = make_client()
    let candidate = new Candidate(client)
    expect(candidate.get_next_role()).toBe(null)
})

test('should become leader if being voted', () => {
    let client = make_client()
    let candidate = new Candidate(client)
    candidate.on_rpc({ sender: 'test0', message: new RequestVoteRPCReply(0, true) })
    candidate.on_rpc({ sender: 'test1', message: new RequestVoteRPCReply(0, true) })
    candidate.on_rpc({ sender: 'test2', message: new RequestVoteRPCReply(0, true) })
    expect(candidate.get_next_role()).toBeInstanceOf(Leader)
})

test('should not become leader if being split voted', () => {
    let client = make_client()
    let candidate = new Candidate(client)
    candidate.on_rpc({ sender: 'test0', message: new RequestVoteRPCReply(0, true) })
    candidate.on_rpc({ sender: 'test1', message: new RequestVoteRPCReply(0, true) })
    candidate.on_rpc({ sender: 'test1', message: new RequestVoteRPCReply(0, true) })
    expect(candidate.get_next_role()).toBe(null)
})

test('should request vote at the beginning', () => {
    let rpc = new MockRPCService
    let client = make_client(rpc.get_client('test0'))
    let candidate = new Candidate(client)
    candidate.on_start()
    expect(_.some(rpc.logs, log => log.message instanceof RequestVoteRPC)).toBe(true)
})


test('should become candidate if other leader is found', () => {
    let rpc = new MockRPCService
    let client = make_client(rpc.get_client('test0'))
    let candidate = new Candidate(client)
    candidate.on_start()
    expect(candidate.on_rpc({ sender: 'test_0', message: new AppendEntriesRPC(candidate.client.state.currentTerm) })).toBeInstanceOf(Follower)
})

test('should not become candidate if other leader has smaller term', () => {
    let rpc = new MockRPCService
    let client = make_client(rpc.get_client('test0'))
    let candidate = new Candidate(client)
    candidate.on_start()
    expect(candidate.on_rpc({ sender: 'test_0', message: new AppendEntriesRPC(candidate.client.state.currentTerm - 1) })).toBe(null)
})
