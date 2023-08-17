import PostController from '../../src/posts/postController'
import {v4 as uuidv4} from 'uuid'
import {StatusCodes} from 'http-status-codes'
import {NextFunction} from 'express'
import {NotFoundException} from '../../src/notFoundException'
import {BadRequestException} from '../../src/badRequestException'

// setup
jest.mock('../../src/posts/postService', () => {
    return jest.fn().mockImplementation(() => {
        return {
            createPost: jest.fn(),
            deletePost: jest.fn(),
            getAllPosts: jest.fn(),
            getPost: jest.fn(),
            updatePost: jest.fn()
        }
    })
})

describe('Post controller', () => {
    const postController = new PostController()
    it('addPost responds with data that is returned from the PostService', async () => {
        // given
        const mockPost = {id: uuidv4(), userId: 'the user', title: 'the title', body: 'the body'}
        const request = {
            body: {userId: 'the user', title: 'the title', body: 'the body'}
        }
        const response = {
            status: jest.fn(function () {
                return this
            }), send: jest.fn(),
        };

        (postController.postService.createPost as jest.Mock).mockImplementation((userId, title, body) => {
            if (userId === 'the user' && title === 'the title' && body === 'the body') {
                return mockPost
            } else {
                return null
            }
        })

        // when
        await postController.createPost(request as any, response as any)

        // then
        expect(response.send).toHaveBeenCalledWith({message: mockPost})
        expect(response.status).toHaveBeenCalledWith(StatusCodes.CREATED)
    })
    it('updatePost responds with data that is returned from the PostService', async () => {
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
            send: jest.fn(),
        };

        (postController.postService.updatePost as jest.Mock).mockImplementation((sentId, userId, title, body) => {
            if (sentId === id && userId === 'the user' && title === undefined && body === 'the new message!') {
                return mockPost
            } else {
                return null
            }
        })

        // when
        await postController.updatePost(request as any, response as any, jest.fn())

        // then
        expect(response.status).toHaveBeenCalledWith(StatusCodes.OK)
        expect(response.send).toHaveBeenCalledWith({message: mockPost})
    })
    it('getPost responds with data that is returned from the PostService', async () => {
        // given
        let id: string = uuidv4()
        const mockPost = {id: id, userId: 'the user', title: 'the title', body: 'the body'}
        const request = {
            params: {id: id},
        }
        const response = {
            status: jest.fn(function () {
                return this
            }),
            send: jest.fn(),
        };

        (postController.postService.getPost as jest.Mock).mockImplementation((sentId) => {
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
        expect(response.send).toHaveBeenCalledWith({message: mockPost})
    })
    it('getAllPosts responds with data that is returned from the PostService', async () => {
        // given
        let id: string = uuidv4()
        let id2: string = uuidv4()
        const mockPost = {id: id, userId: 'the user', title: 'the title', body: 'the body'}
        const mockPost2 = {id: id2, userId: 'the user', title: 'the title', body: 'the body'}
        const request = {}
        const response = {
            status: jest.fn(function () {
                return this
            }),
            send: jest.fn(),
        };

        (postController.postService.getAllPosts as jest.Mock).mockImplementation(() => {
            return [mockPost, mockPost2]
        })

        // when
        await postController.getPosts(request as any, response as any)

        // then
        expect(response.status).toHaveBeenCalledWith(StatusCodes.OK)
        expect(response.send).toHaveBeenCalledWith({message: [mockPost, mockPost2]})
    })
    it('getPost should next error that is returned from the PostService', async () => {
        // given
        let id: string = uuidv4()
        const request = {
            params: {id: id},
        }
        const response = {};

        (postController.postService.getPost as jest.Mock).mockImplementation(() => {
            throw new NotFoundException('id')
        })
        const next: NextFunction = jest.fn()

        // when
        await postController.getPost(request as any, response as any, next)

        // then
        expect(next).toHaveBeenCalledWith(expect.any(NotFoundException))
    })
    it.each`
    fnx
    ${postController.getPost}
    ${postController.deletePost}
    `(`$fnx should next error when id is not UUID`, async (fnx) => {
        // given
        const request = {
            params: {id: 'undefined'},
        }
        const response = {}

        const next: NextFunction = jest.fn()

        // when
        await fnx.fnx(request as any, response as any, next)

        // then
        expect(next).toHaveBeenCalledWith(expect.any(BadRequestException))
    })
    it('updatePost should next error when id is not UUID', async () => {
        // given
        const request = {
            params: {id: 'undefined'},
            body: {
                userId: 'the user',
                title: undefined,
                body: 'the new message!'
            },
        }
        const response = {}

        const next: NextFunction = jest.fn()

        // when
        await postController.updatePost(request as any, response as any, next)

        // then
        expect(next).toHaveBeenCalledWith(expect.any(BadRequestException))
    })
    it('deletePost should call service and respond with NO_CONTENT', async () => {
        // given
        let id: string = uuidv4()
        const request = {
            params: {id: id},
        }
        const response = {
            sendStatus: jest.fn(function () {
                return this
            })
        }

        // when
        await postController.deletePost(request as any, response as any, jest.fn())

        // then
        expect(postController.postService.deletePost).toHaveBeenCalledWith(id)
        expect(response.sendStatus).toHaveBeenCalledWith(StatusCodes.NO_CONTENT)
    })
})

