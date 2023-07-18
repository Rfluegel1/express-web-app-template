import Post from '../../src/domain/post'

describe('domain functions work', () => {
    let uuidRegex : RegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    it('default constructor sets default values', () => {
        // when
        let result: Post = new Post()
        // then
        expect(result.userId).toEqual('')
        expect(result.id).toMatch(uuidRegex)
        expect(result.title).toEqual('')
        expect(result.body).toEqual('')
    })
    it('values constructor sets values', () => {
        // when
        let result: Post = new Post('the user', 'the title', 'the message')
        // then
        expect(result.userId).toEqual('the user')
        expect(result.id).toMatch(uuidRegex)
        expect(result.title).toEqual('the title')
        expect(result.body).toEqual('the message')
    })
})
