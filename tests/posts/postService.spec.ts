import PostService from '../../src/posts/postService'
import {v4 as uuidv4} from 'uuid'
import {UUID_REG_EXP} from '../../src/contants'
import Post from '../../src/posts/post'

// setup
jest.mock('../../src/posts/postRepository', () => {
    return jest.fn().mockImplementation(() => {
        return {
            post: jest.fn(),
            get: jest.fn(),
            getAll: jest.fn(),
            del: jest.fn(),
            update: jest.fn()
        }
    })
})

describe('service functions work', () => {
    let service = new PostService()
    it('post returns Post', async () => {
        const expectedPost = {userId: 'the user', title: 'the title', body: 'the message!'}
        // when
        let result = await service.addPost('the user', 'the title', 'the message!')
        // then
        expect(service.postRepository.post).toHaveBeenCalledWith(expect.objectContaining(expectedPost))
        expect(result.userId).toEqual('the user')
        expect(result.title).toEqual('the title')
        expect(result.body).toEqual('the message!')
        expect(result.id).toMatch(UUID_REG_EXP)
    })
    it('update returns updated Post', async () => {
        //given
        const id = uuidv4()
        const expectedPost = {userId: 'the user', title: 'the title', body: 'the message!'};
        (service.postRepository.get as jest.Mock).mockImplementation(jest.fn(() => {
            let post = new Post()
            post.id = id
            return post
        }))
        // when
        let result = await service.update(id, 'the user', 'the title', 'the message!')
        // then
        expect(service.postRepository.update).toHaveBeenCalledWith(expect.objectContaining(expectedPost))
        expect(result.userId).toEqual('the user')
        expect(result.title).toEqual('the title')
        expect(result.body).toEqual('the message!')
        expect(result.id).toEqual(id)
    })
    it('update only sets defined fields to updated Post', async () => {
        //given
        const existingPost = new Post('old user', 'old title', 'old body')
        const expectedPost = {userId: 'old user', title: 'old title', body: 'the new message!'};
        (service.postRepository.get as jest.Mock).mockImplementation((sentId: string) => {
            if (sentId === existingPost.id) {
                return existingPost
            } else {
                return null
            }
        })
        // when
        let result = await service.update(existingPost.id, undefined, undefined, 'the new message!')
        // then
        expect(service.postRepository.update).toHaveBeenCalledWith(expect.objectContaining(expectedPost))
        expect(result.userId).toEqual('old user')
        expect(result.title).toEqual('old title')
        expect(result.body).toEqual('the new message!')
        expect(result.id).toEqual(existingPost.id)
    })
    it('get returns post from repo', async () => {
        //given
        const id = uuidv4()
        const mockPost = {id: id, userId: 'the user', title: 'the title', body: 'the message!'};

        (service.postRepository.get as jest.Mock).mockImplementation((sentId: string) => {
            if (sentId === id) {
                return mockPost
            } else {
                return null
            }
        })
        // when
        const result = await service.get(id)
        // then
        expect(result.userId).toEqual('the user')
        expect(result.title).toEqual('the title')
        expect(result.body).toEqual('the message!')
        expect(result.id).toEqual(id)
    })
    it('getAll returns posts from repo', async () => {
        //given
        const id1 = uuidv4()
        const id2 = uuidv4()
        const mockPost1 = {id: id1, userId: 'the user', title: 'the title', body: 'the message!'}
        const mockPost2 = {id: id2, userId: 'the user', title: 'the title', body: 'the message!'};

        (service.postRepository.getAll as jest.Mock).mockImplementation(() => {
            return [mockPost1, mockPost2]
        })
        // when
        const result = await service.getAll()
        // then
        expect(result.length).toEqual(2)
        let firstPost = result.find((post: Post) => post.id === id1)
        expect(firstPost.userId).toEqual('the user')
        expect(firstPost.title).toEqual('the title')
        expect(firstPost.body).toEqual('the message!')
        let secondPost = result.find((post: Post) => post.id === id2)
        expect(secondPost.userId).toEqual('the user')
        expect(secondPost.title).toEqual('the title')
        expect(secondPost.body).toEqual('the message!')
        expect(secondPost.id).toEqual(id2)
    })
    it('delete calls to repo', async () => {
        //given
        const id = uuidv4()
        // when
        await service.del(id)
        // then
        expect(service.postRepository.del).toHaveBeenCalledWith(id)
    })
})
