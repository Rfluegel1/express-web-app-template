import PostRepository from '../../../src/backend/posts/postRepository'
import {v4 as uuidv4} from 'uuid'
import Post from '../../../src/backend/posts/post'
import {NotFoundException} from '../../../src/backend/exceptions/notFoundException'

// setup
jest.mock('typeorm', () => ({
    DataSource: jest.fn().mockImplementation(() => ({
        query: jest.fn(),
        initialize: jest.fn(),
        destroy: jest.fn()
    })),
}))
jest.mock('../../../src/backend/Logger', () => ({
    getLogger: jest.fn(() => {
        return {
            error: jest.fn()
        }
    })
}))

const repository = new PostRepository()
beforeEach(() => {
    repository.postDataSource.query = jest.fn()
    repository.postDataSource.initialize = jest.fn()
    repository.postDataSource.destroy = jest.fn()
})

describe('Post repository', () => {
    it('initialize should initialize postDataSource', async () => {
        //when
        await repository.initialize()
        //then
        expect(repository.postDataSource.initialize).toHaveBeenCalled()
    })
    it('initialize should log actual error and throw db error', async () => {
        // given
        let error = new Error('DB Error');
        (repository.postDataSource.initialize as jest.Mock).mockRejectedValue(error)
        // expect
        await expect(repository.initialize()).rejects.toThrow('Error interacting with the database')
    })
    it('destroy should destroy postDataSource', async () => {
        //when
        await repository.destroy()
        //then
        expect(repository.postDataSource.destroy).toHaveBeenCalled()
    })
    it('destroy should log actual error and throws db error', async () => {
        // given
        let error = new Error('DB Error');
        (repository.postDataSource.destroy as jest.Mock).mockRejectedValue(error)
        //expect
        await expect(repository.destroy()).rejects.toThrow('Error interacting with the database')
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
    it('createPost logs error and throws database exception', async () => {
        //given
        let error = new Error('DB Error');
        (repository.postDataSource.query as jest.Mock).mockRejectedValue(error)
        //expect
        await expect(repository.createPost(new Post())).rejects.toThrow('Error interacting with the database')
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
    it('getPost logs error and throws database exception', async () => {
        // given
        let error = new Error('DB Error');
        (repository.postDataSource.query as jest.Mock).mockRejectedValue(error)
        //expect
        await expect(repository.getPost(uuidv4())).rejects.toThrow('Error interacting with the database')
    })
    it('getPost throws not found when query result is empty', async () => {
        //given
        (repository.postDataSource.query as jest.Mock).mockImplementation(jest.fn(() => {
            return []
        }))
        // when and then
        await expect(() => repository.getPost(uuidv4())).rejects.toThrow(NotFoundException)
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
    it('getAllPosts logs error and throws database exception', async () => {
        // given
        let error = new Error('DB Error');
        (repository.postDataSource.query as jest.Mock).mockRejectedValue(error)
        //expect
        await expect(repository.getAllPosts()).rejects.toThrow('Error interacting with the database')
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
    it('deletePost logs error and throws database exception', async () => {
        // given
        let error = new Error('DB Error');
        (repository.postDataSource.query as jest.Mock).mockRejectedValue(error)
        //expect
        await expect(repository.deletePost(uuidv4())).rejects.toThrow('Error interacting with the database')
    })
    it('updatePost updates post in postDataSource', async () => {
        //given
        repository.postDataSource.query = jest.fn()
        const mockPost = new Post('the new user', 'the new title', 'the new message!')
        // when
        await repository.updatePost(mockPost)
        // then
        expect(repository.postDataSource.query).toHaveBeenCalledWith(
            'UPDATE posts SET userId=$1, title=$2, body=$3 WHERE id=$4',
            ['the new user', 'the new title', 'the new message!', mockPost.id]
        )
    })
    it('updatePost logs error and throws database exception', async () => {
        // given
        let error = new Error('DB Error');
        (repository.postDataSource.query as jest.Mock).mockRejectedValue(error)
        //expect
        await expect(repository.updatePost(new Post())).rejects.toThrow('Error interacting with the database')
    })
})
