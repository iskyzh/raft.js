import { Client, ROLE } from './client'
import { MockRPCService } from './rpc/mockRPC'
import { RequestVoteRPC, RequestVoteRPCReply } from './rpc/requestVote'
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
    client.begin_election()
    expect(client.state.currentTerm).toBe(234)
  })

  test('should vote for itself', () => {
    let rpc = new MockRPCService
    let client = new Client(rpc.get_client('test'), 'test')
    client.begin_election()
    client.on_tick()
    expect(_.some(rpc.logs, log => log.message == 'vote for test')).toBe(true)
  })

  test('should become leader', () => {
    let rpc = new MockRPCService
    let client = new Client(rpc.get_client('test'), 'test')
    client.set_cluster_number(5)
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
    client.set_cluster_number(5)
    client.on_election_timeout()
    client.on_being_voted(new RequestVoteRPCReply(0, true))
    client.on_being_voted(new RequestVoteRPCReply(0, true))
    client.on_being_voted(new RequestVoteRPCReply(0, false))
    client.on_election_end()
    expect(client.role).toBe(ROLE.Candidate)
  })
})
