import { post } from '../../src/services/posts'
import Post from '../../src/domain/post'

describe('service functions work', () => {
    it('post returns message and UUID', () => {
        // given
        let uuidRegex : RegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        // when
        let result: Post = post('the user', 'the title', 'the message!')
        // then
        expect(result.userId).toEqual('the user')
        expect(result.title).toEqual('the title')
        expect(result.body).toEqual('the message!')
        expect(result.id).toMatch(uuidRegex)
    })
})
