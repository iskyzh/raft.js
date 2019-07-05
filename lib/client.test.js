import { Client, ROLE } from './client'
import { MockRPCService } from './rpc/mockRPC'
import { RequestVoteRPC, RequestVoteRPCReply } from './rpc/requestVote'
import { AppendEntriesRPC, AppendEntriesRPCReply } from './rpc/appendEntries'

import _ from 'lodash'

test('should start as followers', () => {
  let client = new Client
  expect(client.role).toBe(ROLE.Follower)
})

test('should begin election if timed out', () => {
  let client = new Client
  client.on_election_timeout()
  expect(client.role).toBe(ROLE.Candidate)
})

describe('as candidate', () => {
  test('should increate term', () => {
    let client = new Client
    client.state.currentTerm = 233
    client.become_candidate()
    expect(client.state.currentTerm).toBe(234)
  })

  test('should vote for itself', () => {
    let rpc = new MockRPCService
    let client = new Client(rpc.get_client('test'), 'test')
    client.set_clusters(['test0', 'test1', 'test2', 'test3', 'test4'])
    client.become_candidate()
    client.on_tick()
    expect(_.some(rpc.logs, log => log.message.type == 'requestVote' && log.message.candidateID == 'test')).toBe(true)
  })

  test('should become leader', () => {
    let rpc = new MockRPCService
    let client = new Client(rpc.get_client('test'), 'test')
    client.set_clusters(['test0', 'test1', 'test2', 'test3', 'test4'])
    client.on_election_timeout()
    client.on_being_voted(new RequestVoteRPCReply(0, true))
    client.on_being_voted(new RequestVoteRPCReply(0, true))
    client.on_being_voted(new RequestVoteRPCReply(0, true))
    client.on_election_end()
    expect(client.role).toBe(ROLE.Leader)
  })

  test('should become candidate', () => {
    let rpc = new MockRPCService
    let client = new Client(rpc.get_client('test'), 'test')
    client.set_clusters(['test0', 'test1', 'test2', 'test3', 'test4'])
    client.on_election_timeout()
    client.on_being_voted(new RequestVoteRPCReply(0, true))
    client.on_being_voted(new RequestVoteRPCReply(0, true))
    client.on_being_voted(new RequestVoteRPCReply(0, false))
    client.on_election_end()
    expect(client.role).toBe(ROLE.Candidate)
  })

  test('should become follower if leader is established', () => {
    let rpc = new MockRPCService
    let client = new Client(rpc.get_client('test'), 'test')
    client.set_clusters(['test0', 'test1', 'test2', 'test3', 'test4'])
    client.on_election_timeout()
    client.on_being_voted(new RequestVoteRPCReply(0, true))
    client.on_being_voted(new RequestVoteRPCReply(0, true))
    client.on_being_voted(new RequestVoteRPCReply(0, true))
    client.on_append_entries('test0', new AppendEntriesRPC(2))
    expect(client.role).toBe(ROLE.Follower)
  })

  test('should not become follower if leader has smaller term', () => {
    let rpc = new MockRPCService
    let client = new Client(rpc.get_client('test'), 'test')
    client.set_clusters(['test0', 'test1', 'test2', 'test3', 'test4'])
    client.on_election_timeout()
    client.on_append_entries('test0', new AppendEntriesRPC(0))
    expect(client.role).toBe(ROLE.Candidate)
  })
})

describe('as leader', () => {
  test('should establish authority', () => {
    let rpc = new MockRPCService
    let client = new Client(rpc.get_client('test'), 'test')
    client.set_clusters(['test0', 'test1', 'test2', 'test3', 'test4'])
    client.become_leader()
    expect(_.some(rpc.logs, log => log.message.type == 'appendEntries')).toBe(true)
  })
})

describe('as follower', () => {
  test('should reply to vote', () => {
    let rpc = new MockRPCService
    let client = new Client(rpc.get_client('test'), 'test')
    client.on_vote('test_sender', new RequestVoteRPC(0, 'test_sender', 0, 0))
    expect(_.some(rpc.logs, log => log.message.type == 'requestVoteReply' && log.message.voteGranted == true)).toBe(true)
  })

  test('should vote only once', () => {
    let rpc = new MockRPCService
    let client = new Client(rpc.get_client('test'), 'test')
    client.on_vote('test_sender', new RequestVoteRPC(1, 'test_sender', 0, 0))
    client.on_vote('test_sender_2', new RequestVoteRPC(1, 'test_sender_2', 0, 0))
    expect(_.some(rpc.logs, log => log.message.type == 'requestVoteReply' && log.to == 'test_sender_2' && log.message.voteGranted == false)).toBe(true)
  })
})
