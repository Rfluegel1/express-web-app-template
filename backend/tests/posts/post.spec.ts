import Post from '../../../backend/src/posts/post'
import {UUID_REG_EXP} from '../../src/contants'

describe('Post object', () => {
    it('default constructor sets default values', () => {
        // when
        const result: Post = new Post()
        // then
        expect(result.userId).toEqual('')
        expect(result.id).toMatch(UUID_REG_EXP)
        expect(result.title).toEqual('')
        expect(result.body).toEqual('')
    })
    it('values constructor sets values', () => {
        // when
        const result: Post = new Post('the user', 'the title', 'the body')
        // then
        expect(result.userId).toEqual('the user')
        expect(result.id).toMatch(UUID_REG_EXP)
        expect(result.title).toEqual('the title')
        expect(result.body).toEqual('the body')
    })
})
