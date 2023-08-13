import PostRepository from '../../src/posts/postRepository'
import {v4 as uuidv4} from 'uuid'
import Post from '../../src/posts/post'
import {NotFoundException} from '../../src/notFoundException'

// setup
jest.mock('typeorm', () => ({
    DataSource: jest.fn().mockImplementation(() => ({
        query: jest.fn(),
        initialize: jest.fn(),
    })),
}))

describe('Post repository', () => {
    const repository = new PostRepository()
    it('initialize should initialize postDataSource', async () => {
        //when
        await repository.initialize()
        //then
        expect(repository.postDataSource.initialize).toHaveBeenCalled()
    })
    it('createPost inserts into postDataSource', async () => {
        //given
        const post = new Post('the user', 'the title', 'the body')
        // when
        await repository.createPost(post)
        // then
        expect(repository.postDataSource.query).toHaveBeenCalledWith(
            'INSERT INTO' +
            ' posts (id, userId, title, body) ' +
            'VALUES ($1, $2, $3, $4)',
            [post.id, 'the user', 'the title', 'the body']
        )
    })
    it('getPost selects from postDataSource', async () => {
        //given
        const id = uuidv4();
        (repository.postDataSource.query as jest.Mock).mockImplementation(jest.fn((query, parameters) => {
            if (query === 'SELECT * FROM posts WHERE id=$1' && parameters[0] === id) {
                return [{id: id, userid: 'the user', title: 'the title', body: 'the body',}]
            }
        }))
        // when
        const actual = await repository.getPost(id)
        // then
        expect(actual).toBeInstanceOf(Post)
        expect(actual.id).toEqual(id)
        expect(actual.userId).toEqual('the user')
        expect(actual.title).toEqual('the title')
        expect(actual.body).toEqual('the body')
    })
    it('getAllPosts selects from postDataSource', async () => {
        //given
        const id1 = uuidv4()
        const id2 = uuidv4()
        const mockPost1 = {id: id1, userid: 'the user1', title: 'the title1', body: 'the message 1!'}
        const mockPost2 = {id: id2, userid: 'the user2', title: 'the title2', body: 'the message 2!'};
        (repository.postDataSource.query as jest.Mock).mockImplementation(jest.fn((query) => {
            if (query === 'SELECT * FROM posts') {
                return [mockPost1, mockPost2]
            }
        }))
        // when
        const actual = await repository.getAllPosts()
        // then
        expect(actual.length).toEqual(2)
        expect(actual[0]).toBeInstanceOf(Post)
        expect(actual[0].id).toEqual(id1)
        expect(actual[0].userId).toEqual('the user1')
        expect(actual[0].title).toEqual('the title1')
        expect(actual[0].body).toEqual('the message 1!')
        expect(actual[1]).toBeInstanceOf(Post)
        expect(actual[1].id).toEqual(id2)
        expect(actual[1].userId).toEqual('the user2')
        expect(actual[1].title).toEqual('the title2')
        expect(actual[1].body).toEqual('the message 2!')
    })
    it('getPost throws not found when query result is empty', async () => {
        //given
        (repository.postDataSource.query as jest.Mock).mockImplementation(jest.fn(() => {
            return []
        }))
        // when and then
        await expect(() => repository.getPost(uuidv4())).rejects.toThrow(NotFoundException)
    })
    it('deletePost deletes from postDataSource', async () => {
        //given
        const id = uuidv4()
        // when
        await repository.deletePost(id)
        // then
        expect(repository.postDataSource.query).toHaveBeenCalledWith(
            'DELETE FROM posts WHERE id=$1',
            [id]
        )
    })
    it('updatePost updates post in postDataSource', async () => {
        //given
        const mockPost = new Post('the new user', 'the new title', 'the new message!')
        // when
        await repository.updatePost(mockPost)
        // then
        expect(repository.postDataSource.query).toHaveBeenCalledWith(
            'UPDATE posts SET userId=$1, title=$2, body=$3 WHERE id=$4',
            ['the new user', 'the new title', 'the new message!', mockPost.id]
        )
    })
})
