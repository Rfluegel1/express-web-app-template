import {post} from '../../src/posts/postService'
import {UUID_REG_EXP} from "../../src/contants";

describe('service functions work', () => {
    it('post returns message and UUID', () => {
        // when
        let result = post('the user', 'the title', 'the message!')
        // then
        expect(result.userId).toEqual('the user')
        expect(result.title).toEqual('the title')
        expect(result.body).toEqual('the message!')
        expect(result.id).toMatch(UUID_REG_EXP)
    })
})
