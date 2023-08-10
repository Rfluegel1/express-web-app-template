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

describe('repository functions work', () => {
    const repository = new PostRepository()
    it('initialize creates connection to postgresql', async () => {
        //when
        await repository.initialize()
        //then
        expect(repository.postDataSource.initialize).toHaveBeenCalled()
    })
    it('post saves to postgres', async () => {
        //given
        const post = new Post('the user', 'the title', 'the message!')
        // when
        await repository.post(post)
        // then
        expect(repository.postDataSource.query).toHaveBeenCalledWith(
            'INSERT INTO' +
            ' posts (id, userId, title, body) ' +
            'VALUES ($1, $2, $3, $4)',
            [post.id, 'the user', 'the title', 'the message!']
        )
    })
    it('get retrieves from postgres', async () => {
        //given
        const id = uuidv4();
        (repository.postDataSource.query as jest.Mock).mockImplementation(jest.fn((query, parameters) => {
            if (query === 'SELECT * FROM posts WHERE id=$1' && parameters[0] === id) {
                return [{
                    id: id,
                    userid: 'the user',
                    title: 'the title',
                    body: 'the message!',
                }]
            }
        }))
        // when
        const actual = await repository.get(id)
        // then
        expect(actual).toBeInstanceOf(Post)
        expect(actual.id).toEqual(id)
        expect(actual.userId).toEqual('the user')
        expect(actual.title).toEqual('the title')
        expect(actual.body).toEqual('the message!')
    })
    it('get all retrieves from postgres', async () => {
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
        const actual = await repository.getAll()
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
    it('get when not found throws', async () => {
        //given
        (repository.postDataSource.query as jest.Mock).mockImplementation(jest.fn(() => {
            return []
        }))
        // when and then
        await expect(() => repository.get(uuidv4())).rejects.toThrow(NotFoundException)
    })
    it('delete removes from postgres', async () => {
        //given
        const id = uuidv4()
        // when
        await repository.del(id)
        // then
        expect(repository.postDataSource.query).toHaveBeenCalledWith(
            'DELETE FROM posts WHERE id=$1',
            [id]
        )
    })
    it('update updates postgres', async () => {
        //given
        const mockPost = new Post('the new user', 'the new title', 'the new message!')
        // when
        await repository.update(mockPost)
        // then
        expect(repository.postDataSource.query).toHaveBeenCalledWith(
            'UPDATE posts SET userId=$1, title=$2, body=$3 WHERE id=$4',
            ['the new user', 'the new title', 'the new message!', mockPost.id]
        )
    })
})
