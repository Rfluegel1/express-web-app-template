import { hello } from '../src/helloWorld'

describe('Hello World', () => {
    it('says hello world with no name', () => {
        expect(hello()).toEqual('Hello, World!')
    })
    it('says hello world with a name', () => {
        expect(hello('Joe')).toEqual('Hello, Joe!')
    })
})
