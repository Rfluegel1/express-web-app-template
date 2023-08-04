import PostService, {get} from '../../src/posts/postService'
import {v4 as uuidv4} from 'uuid'
import PostRepository from '../../src/posts/postRepository'
import {UUID_REG_EXP} from '../../src/contants'

// setup
jest.mock('../../src/posts/postRepository')

describe('service functions work', () => {
    it('post returns message and UUID', async () => {
        const expectedPost = {userId: 'the user', title: 'the title', body: 'the message!'}
        // when
        let result = await PostService.addPost('the user', 'the title', 'the message!')
        // then
        expect(PostRepository.post).toHaveBeenCalledWith(expect.objectContaining(expectedPost))
        expect(result.userId).toEqual('the user')
        expect(result.title).toEqual('the title')
        expect(result.body).toEqual('the message!')
        expect(result.id).toMatch(UUID_REG_EXP)
    })
    it('get returns post from repo', async () => {
        //given
        const id = uuidv4()
        const mockPost = {id: id, userId: 'the user', title: 'the title', body: 'the message!'};

        (PostRepository.get as jest.Mock).mockImplementation((sentId: string) => {
            if (sentId === id) {
                return mockPost
            } else {
                return null
            }
        })
        // when
        const result = await get(id)
        // then
        expect(result.userId).toEqual('the user')
        expect(result.title).toEqual('the title')
        expect(result.body).toEqual('the message!')
        expect(result.id).toEqual(id)
    })
})
