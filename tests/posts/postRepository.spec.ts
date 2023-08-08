import postRepository from '../../src/posts/postRepository'
import {createConnection, getConnection} from 'typeorm'
import {v4 as uuidv4} from 'uuid'
import Post from '../../src/posts/post'
import {NotFoundException} from '../../src/notFoundException'

// setup
jest.mock('typeorm')

describe('repository functions work', () => {
    it('initialize creates connection to postgresql', async () => {
        //when
        await postRepository.initialize()
        //then
        expect(createConnection).toHaveBeenCalled()
    })
    it('post saves to postgres', async () => {
        //given
        const query = jest.fn();
        (getConnection as jest.Mock).mockReturnValue({query})
        const post = new Post('the user', 'the title', 'the message!')
        // when
        await postRepository.post(post)
        // then
        expect(getConnection).toHaveBeenCalled()
        expect(query).toHaveBeenCalledWith(
            'INSERT INTO' +
            ' posts (id, userId, title, body) ' +
            'VALUES ($1, $2, $3, $4)',
            [post.id, 'the user', 'the title', 'the message!']
        )
    })
    it('get retrieves from postgres', async () => {
        //given
        const id = uuidv4()
        const mockPost = {id: id, userid: 'the user', title: 'the title', body: 'the message!'}
        const query = jest.fn(() => {
            return [mockPost]
        });
        (getConnection as jest.Mock).mockReturnValue({query})
        // when
        const actual = await postRepository.get(id)
        // then
        expect(getConnection).toHaveBeenCalled()
        expect(query).toHaveBeenCalledWith(
            'SELECT * FROM posts WHERE id=$1',
            [id]
        )
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
        const mockPost2 = {id: id2, userid: 'the user2', title: 'the title2', body: 'the message 2!'}
        const query = jest.fn(() => {
            return [mockPost1, mockPost2]
        });
        (getConnection as jest.Mock).mockReturnValue({query})
        // when
        const actual = await postRepository.getAll()
        // then
        expect(getConnection).toHaveBeenCalled()
        expect(query).toHaveBeenCalledWith(
            'SELECT * FROM posts'
        )
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
        const query = jest.fn(() => {
            return []
        });
        (getConnection as jest.Mock).mockReturnValue({query})
        // when and then
        await expect(() => postRepository.get(uuidv4())).rejects.toThrow(NotFoundException)
    })
    it('delete removes from postgres', async () => {
        //given
        const id = uuidv4()
        const query = jest.fn();
        (getConnection as jest.Mock).mockReturnValue({query})
        // when
        await postRepository.del(id)
        // then
        expect(getConnection).toHaveBeenCalled()
        expect(query).toHaveBeenCalledWith(
            'DELETE FROM posts WHERE id=$1',
            [id]
        )
    })
    it('update updates postgres', async () => {
        //given
        const mockPost = new Post('the new user', 'the new title', 'the new message!')
        const query = jest.fn(() => {
            return [mockPost]
        });
        (getConnection as jest.Mock).mockReturnValue({query})
        // when
        await postRepository.update(mockPost)
        // then
        expect(getConnection).toHaveBeenCalled()
        expect(query).toHaveBeenCalledWith(
            'UPDATE posts SET userId=$1, title=$2, body=$3 WHERE id=$4',
            ['the new user', 'the new title', 'the new message!', mockPost.id]
        )
    })
})
