import Post from '../../src/posts/post'
import {UUID_REG_EXP} from '../../src/contants'

describe('domain functions work', () => {
    it('default constructor sets default values', () => {
        // when
        let result = new Post()
        // then
        expect(result.userId).toEqual('')
        expect(result.id).toMatch(UUID_REG_EXP)
        expect(result.title).toEqual('')
        expect(result.body).toEqual('')
    })
    it('values constructor sets values', () => {
        // when
        let result = new Post('the user', 'the title', 'the message')
        // then
        expect(result.userId).toEqual('the user')
        expect(result.id).toMatch(UUID_REG_EXP)
        expect(result.title).toEqual('the title')
        expect(result.body).toEqual('the message')
    })
})
