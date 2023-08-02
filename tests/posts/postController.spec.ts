import PostController from '../../src/posts/postController'
import PostService from '../../src/posts/postService'
import {v4 as uuidv4} from 'uuid'
import {StatusCodes} from 'http-status-codes'

jest.mock('../../src/posts/postService')

describe('POST /addPost', () => {
    it('Should respond with the same data that is returned from the PostService', () => {
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
            status: jest.fn(function (num: number) {
                return this
            }),
            json: jest.fn(),
        };

        // Mock PostService.post to return mockPost
        (PostService.post as jest.Mock).mockImplementation((userId, title, body) => {
            if (userId === 'the user' && title === 'the title' && body === 'the message!') {
                return mockPost
            } else {
                return null
            }
        })

        // when
        PostController.addPost(request as any, response as any)

        // then
        expect(response.json).toHaveBeenCalledWith({message: mockPost})
        expect(response.status).toHaveBeenCalledWith(StatusCodes.CREATED)
    })
})

