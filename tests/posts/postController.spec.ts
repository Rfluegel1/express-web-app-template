import PostController from '../../src/posts/postController'
import PostService from '../../src/posts/postService'
import postService from '../../src/posts/postService'
import {v4 as uuidv4} from 'uuid'
import {StatusCodes} from 'http-status-codes'

// setup
jest.mock('../../src/posts/postService')

describe('Post controller', () => {
    it('addPost should respond with the same data that is returned from the PostService', async () => {
        // given
        let id = uuidv4()
        const mockPost = {id: id, userId: 'the user', title: 'the title', body: 'the message!'}
        const request = {
            body: {
                userId: 'the user',
                title: 'the title',
                body: 'the message!'
            },
        }
        const response = {
            status: jest.fn(function () {
                return this
            }),
            json: jest.fn(),
        };

        (PostService.addPost as jest.Mock).mockImplementation((userId, title, body) => {
            if (userId === 'the user' && title === 'the title' && body === 'the message!') {
                return mockPost
            } else {
                return null
            }
        })

        // when
        await PostController.addPost(request as any, response as any)

        // then
        expect(response.json).toHaveBeenCalledWith({message: mockPost})
        expect(response.status).toHaveBeenCalledWith(StatusCodes.CREATED)
    })
    it('update should respond with the same data that is returned from the PostService', async () => {
        // given
        let id = uuidv4()
        const mockPost = {id: id, userId: 'the user', title: 'the title', body: 'the new message!'}
        const request = {
            params: {
                id: id
            },
            body: {
                userId: 'the user',
                title: undefined,
                body: 'the new message!'
            },
        }
        const response = {
            status: jest.fn(function () {
                return this
            }),
            json: jest.fn(),
        };

        (PostService.update as jest.Mock).mockImplementation((sentId, userId, title, body) => {
            if (sentId === id && userId === 'the user' && title === undefined && body === 'the new message!') {
                return mockPost
            } else {
                return null
            }
        })

        // when
        await PostController.updatePost(request as any, response as any)

        // then
        expect(response.status).toHaveBeenCalledWith(StatusCodes.OK)
        expect(response.json).toHaveBeenCalledWith({message: mockPost})
    })
    it('getPost should respond with the same data that is returned from the PostService', async () => {
        // given
        let id = uuidv4()
        const mockPost = {id: id, userId: 'the user', title: 'the title', body: 'the message!'}
        const request = {
            params: {id: id},
        }
        const response = {
            status: jest.fn(function () {
                return this
            }),
            json: jest.fn(),
        };

        (PostService.get as jest.Mock).mockImplementation((sentId) => {
            if (id === sentId) {
                return mockPost
            } else {
                return null
            }
        })

        // when
        await PostController.getPost(request as any, response as any)

        // then
        expect(response.status).toHaveBeenCalledWith(StatusCodes.OK)
        expect(response.json).toHaveBeenCalledWith({message: mockPost})
    })
    it('delPost should respond with a 204', async () => {
        // given
        let id = uuidv4()
        const request = {
            params: {id: id},
        }
        const response = {
            sendStatus: jest.fn(function () {
                return this
            })
        }

        // when
        await PostController.deletePost(request as any, response as any)

        // then
        expect(postService.del).toHaveBeenCalledWith(id)
        expect(response.sendStatus).toHaveBeenCalledWith(StatusCodes.NO_CONTENT)
    })


})

