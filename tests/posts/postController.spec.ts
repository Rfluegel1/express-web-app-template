import PostController from '../../src/posts/postController'
import {v4 as uuidv4} from 'uuid'
import {StatusCodes} from 'http-status-codes'
import {NextFunction} from 'express'

// setup
jest.mock('../../src/posts/postService', () => {
    return jest.fn().mockImplementation(() => {
        return {
            addPost: jest.fn(),
            get: jest.fn(),
            getAll: jest.fn(),
            del: jest.fn(),
            update: jest.fn()
        }
    })
})

describe('Post controller', () => {
    const postController = new PostController()
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

        (postController.postService.addPost as jest.Mock).mockImplementation((userId, title, body) => {
            if (userId === 'the user' && title === 'the title' && body === 'the message!') {
                return mockPost
            } else {
                return null
            }
        })

        // when
        await postController.addPost(request as any, response as any)

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

        (postController.postService.update as jest.Mock).mockImplementation((sentId, userId, title, body) => {
            if (sentId === id && userId === 'the user' && title === undefined && body === 'the new message!') {
                return mockPost
            } else {
                return null
            }
        })

        // when
        await postController.updatePost(request as any, response as any)

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

        (postController.postService.get as jest.Mock).mockImplementation((sentId) => {
            if (id === sentId) {
                return mockPost
            } else {
                return null
            }
        })

        // when
        await postController.getPost(request as any, response as any, jest.fn())

        // then
        expect(response.status).toHaveBeenCalledWith(StatusCodes.OK)
        expect(response.json).toHaveBeenCalledWith({message: mockPost})
    })
    it('getAllPost should respond with the same data that is returned from the PostService', async () => {
        // given
        let id = uuidv4()
        let id2 = uuidv4()
        const mockPost = {id: id, userId: 'the user', title: 'the title', body: 'the message!'}
        const mockPost2 = {id: id2, userId: 'the user', title: 'the title', body: 'the message!'}
        const request = {}
        const response = {
            status: jest.fn(function () {
                return this
            }),
            json: jest.fn(),
        };

        (postController.postService.getAll as jest.Mock).mockImplementation(() => {
            return [mockPost, mockPost2]
        })

        // when
        await postController.getPosts(request as any, response as any)

        // then
        expect(response.status).toHaveBeenCalledWith(StatusCodes.OK)
        expect(response.json).toHaveBeenCalledWith({message: [mockPost, mockPost2]})
    })
    it('getPost should next error that is returned from the PostService', async () => {
        // given
        let id = uuidv4()
        const request = {
            params: {id: id},
        }
        const response = {};

        (postController.postService.get as jest.Mock).mockImplementation(() => {
            throw new Error
        })
        const next: NextFunction = jest.fn()

        // when
        await postController.getPost(request as any, response as any, next)

        // then
        expect(next).toHaveBeenCalledWith(expect.any(Error))
    })
    it('delPost should call service and respond with a 204', async () => {
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
        await postController.deletePost(request as any, response as any)

        // then
        expect(postController.postService.del).toHaveBeenCalledWith(id)
        expect(response.sendStatus).toHaveBeenCalledWith(StatusCodes.NO_CONTENT)
    })


})

