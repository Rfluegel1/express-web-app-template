import postRepository from '../../src/posts/postRepository'
import {createConnection, getConnection} from 'typeorm'
import {v4 as uuidv4} from 'uuid'
import Post from '../../src/posts/post'

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
        expect(actual.id).toEqual(id)
        expect(actual.userId).toEqual('the user')
        expect(actual.title).toEqual('the title')
        expect(actual.body).toEqual('the message!')
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
