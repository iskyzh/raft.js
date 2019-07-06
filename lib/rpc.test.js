import { MockRPC, MockRPCClient } from './rpc'

test('should get client', () => {
    const rpc = new MockRPC
    expect(rpc.get_client('test', () => {})).toBeInstanceOf(MockRPCClient)
})

test('should have reply', () => {
    const rpc = new MockRPC
    const test1 = rpc.get_client('test1', (from, rpc) => rpc.message)
    const test2 = rpc.get_client('test2', () => {})
    return test2.call_rpc('test1', { message: 'hello' }).then(message => {
        expect(message).toBe('hello')
    })
})
