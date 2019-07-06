import { Client } from '../client'
import { Follower } from './follower'
import { Candidate } from './candidate'
import _ from 'lodash'
import { RequestVoteRPC, RequestVoteRPCReply, AppendEntriesRPC } from '../rpc';
import { MockRPCService } from '../rpc/mockRPC';

function make_other_client(name) {
    return `test${name}`
}

function make_client(rpc) {
    let client = new Client(rpc)
    client.set_clusters(_.map(_.range(5), d => make_other_client(d)))
    return client
}

test('should return next state if timed out', () => {
    let follower = new Follower(new Client)
    let promise = new Promise((resolve) => setTimeout(resolve, 500))
    return expect(promise.then(() => follower.get_next_role())).resolves.toBeInstanceOf(Candidate)
})

test('should not return next state if not timed out', () => {
    let follower = new Follower(new Client)
    expect(follower.get_next_role()).toBe(null)
})

test('should remain follower if receive rpc', () => {
    let follower = new Follower(new Client)
    let promise = new Promise((resolve) => setTimeout(resolve, 500))
    return expect(promise.then(() => {
        follower.on_rpc({ sender: 'test0', message: { term: 0 } })
        return follower.get_next_role()
    })).resolves.toBe(null)
})

test('should reply to request vote rpc', () => {
    let rpc = new MockRPCService
    let client = make_client(rpc.get_client('test0'))
    let follower = new Follower(client)
    follower.on_rpc({ sender: 'test1', message: new RequestVoteRPC(0, 'test1', 0, 0)})
    follower.on_rpc({ sender: 'test1', message: new RequestVoteRPC(0, 'test1', 0, 0)})
    expect(_.some(rpc.logs, log => log.message instanceof RequestVoteRPCReply)).toBe(true)
    expect(_.some(rpc.logs, log => log.message instanceof RequestVoteRPCReply && log.message.voteGranted == false)).toBe(false)
})

test('should vote only once', () => {
    let rpc = new MockRPCService
    let client = make_client(rpc.get_client('test0'))
    let follower = new Follower(client)
    follower.on_rpc({ sender: 'test1', message: new RequestVoteRPC(0, 'test1', 0, 0)})
    follower.on_rpc({ sender: 'test2', message: new RequestVoteRPC(0, 'test2', 0, 0)})
    expect(_.some(rpc.logs, log => log.message instanceof RequestVoteRPCReply && log.message.voteGranted == false)).toBe(true)
})

test('should append to log', () => {
    let rpc = new MockRPCService
    let client = make_client(rpc.get_client('test0'))
    let follower = new Follower(client)
    follower.on_rpc({ sender: 'test1', message: new AppendEntriesRPC(client.state.currentTerm, 'test1', -1, 0, 'test', 0)})
    expect(client.state.log).toContainEqual({ entry: 'test', term: client.state.currentTerm })
})
