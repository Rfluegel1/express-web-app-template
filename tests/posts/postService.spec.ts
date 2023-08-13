import PostService from '../../src/posts/postService'
import {v4 as uuidv4} from 'uuid'
import {UUID_REG_EXP} from '../../src/contants'
import Post from '../../src/posts/post'

// setup
jest.mock('../../src/posts/postRepository', () => {
    return jest.fn().mockImplementation(() => {
        return {
            createPost: jest.fn(),
            getPost: jest.fn(),
            getAllPosts: jest.fn(),
            deletePost: jest.fn(),
            updatePost: jest.fn()
        }
    })
})

describe('Post service', () => {
    let service = new PostService()
    it('CreatePost calls repository and returns Post', async () => {
        const expectedPost = {userId: 'the user', title: 'the title', body: 'the body'}
        // when
        let result = await service.createPost('the user', 'the title', 'the body')
        // then
        expect(service.postRepository.createPost).toHaveBeenCalledWith(expect.objectContaining(expectedPost))
        expect(result.userId).toEqual('the user')
        expect(result.title).toEqual('the title')
        expect(result.body).toEqual('the body')
        expect(result.id).toMatch(UUID_REG_EXP)
    })
    it('updatePost gets from repository, calls repository to update, and returns Post', async () => {
        //given
        const id = uuidv4()
        const expectedPost = {userId: 'the user', title: 'the title', body: 'the body'};
        (service.postRepository.getPost as jest.Mock).mockImplementation(jest.fn(() => {
            let post = new Post()
            post.id = id
            return post
        }))
        // when
        let result = await service.updatePost(id, 'the user', 'the title', 'the body')
        // then
        expect(service.postRepository.updatePost).toHaveBeenCalledWith(expect.objectContaining(expectedPost))
        expect(result.userId).toEqual('the user')
        expect(result.title).toEqual('the title')
        expect(result.body).toEqual('the body')
        expect(result.id).toEqual(id)
    })
    it('updatePost only sets defined fields on updated Post', async () => {
        //given
        const existingPost = new Post('old user', 'old title', 'old body')
        const expectedPost = {userId: 'old user', title: 'old title', body: 'new body'};
        (service.postRepository.getPost as jest.Mock).mockImplementation((sentId: string) => {
            if (sentId === existingPost.id) {
                return existingPost
            }
        })
        // when
        let result = await service.updatePost(existingPost.id, undefined, undefined, 'new body')
        // then
        expect(service.postRepository.updatePost).toHaveBeenCalledWith(expect.objectContaining(expectedPost))
        expect(result.userId).toEqual('old user')
        expect(result.title).toEqual('old title')
        expect(result.body).toEqual('new body')
        expect(result.id).toEqual(existingPost.id)
    })
    it('getPost returns posts from repository', async () => {
        //given
        const id = uuidv4()
        const mockPost = {id: id, userId: 'the user', title: 'the title', body: 'the body'};

        (service.postRepository.getPost as jest.Mock).mockImplementation((sentId: string) => {
            if (sentId === id) {
                return mockPost
            }
        })
        // when
        const result = await service.getPost(id)
        // then
        expect(result.userId).toEqual('the user')
        expect(result.title).toEqual('the title')
        expect(result.body).toEqual('the body')
        expect(result.id).toEqual(id)
    })
    it('getAllPosts returns posts from repository', async () => {
        //given
        const id1 = uuidv4()
        const id2 = uuidv4()
        const mockPost1 = new Post('the user', 'the title', 'the body')
        const mockPost2 = new Post('the user', 'the title', 'the body')
        mockPost1.id = id1
        mockPost2.id = id2;

        (service.postRepository.getAllPosts as jest.Mock).mockImplementation(() => {
            return [mockPost1, mockPost2]
        })
        // when
        const result = await service.getAllPosts()
        // then
        expect(result.length).toEqual(2)
        let firstPost = result.find((post) => post.id === id1)
        expect(firstPost).toBeInstanceOf(Post)
        expect(firstPost?.userId).toEqual('the user')
        expect(firstPost?.title).toEqual('the title')
        expect(firstPost?.body).toEqual('the body')
        let secondPost = result.find((post) => post.id === id2)
        expect(secondPost?.userId).toEqual('the user')
        expect(secondPost?.title).toEqual('the title')
        expect(secondPost?.body).toEqual('the body')
        expect(secondPost?.id).toEqual(id2)
    })
    it('delete calls to repo', async () => {
        //given
        const id = uuidv4()
        // when
        await service.deletePost(id)
        // then
        expect(service.postRepository.deletePost).toHaveBeenCalledWith(id)
    })
})
