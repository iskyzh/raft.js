import { Client } from './client'

test('should create', () => {
    return Promise.resolve(new Client).then(client => expect(client).toBeInstanceOf(Client))
})
