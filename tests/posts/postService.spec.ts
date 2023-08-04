import PostService, {get} from '../../src/posts/postService'
import {v4 as uuidv4} from 'uuid'
import PostRepository from '../../src/posts/postRepository'
import {UUID_REG_EXP} from '../../src/contants'
import Post from '../../src/posts/post'

// setup
jest.mock('../../src/posts/postRepository')

describe('service functions work', () => {
    it('post returns Post', async () => {
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
    it('update returns updated Post', async () => {
        //given
        const id = uuidv4()
        const expectedPost = {userId: 'the user', title: 'the title', body: 'the message!'};
        (PostRepository.get as jest.Mock).mockImplementation(jest.fn(() => {
            let post = new Post()
            post.id = id
            return post
        }))
        // when
        let result = await PostService.update(id, 'the user', 'the title', 'the message!')
        // then
        expect(PostRepository.update).toHaveBeenCalledWith(expect.objectContaining(expectedPost))
        expect(result.userId).toEqual('the user')
        expect(result.title).toEqual('the title')
        expect(result.body).toEqual('the message!')
        expect(result.id).toEqual(id)
    })
    it('update only sets non undefined fields to updated Post', async () => {
        //given
        const existingPost = new Post('old user', 'old title', 'old body')
        const expectedPost = {userId: 'old user', title: 'old title', body: 'the new message!'};
        (PostRepository.get as jest.Mock).mockImplementation((sentId: string) => {
            if (sentId === existingPost.id) {
                return existingPost
            } else {
                return null
            }
        })
        // when
        let result = await PostService.update(existingPost.id, undefined, undefined, 'the new message!')
        // then
        expect(PostRepository.update).toHaveBeenCalledWith(expect.objectContaining(expectedPost))
        expect(result.userId).toEqual('old user')
        expect(result.title).toEqual('old title')
        expect(result.body).toEqual('the new message!')
        expect(result.id).toEqual(existingPost.id)
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
