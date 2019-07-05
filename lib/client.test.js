import { Client, ROLE } from './client'
import { MockRPCService } from './rpc/mockRPC'
import { RequestVoteRPC, RequestVoteRPCReply, AppendEntriesRPC, AppendEntriesRPCReply } from './rpc'
import { Follower } from './role';

import _ from 'lodash'

test('should start as followers', () => {
    let client = new Client
    expect(client.role).toBeInstanceOf(Follower)
})

test('should get timeout', () => {
    let client = new Client
    const timeout = client.get_timeout()
    expect(timeout).toBeGreaterThanOrEqual(150)
    expect(timeout).toBeLessThanOrEqual(300)
})
