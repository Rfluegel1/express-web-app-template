import postRepository from '../../src/posts/postRepository'
import {createConnection} from 'typeorm'

// setup
jest.mock('typeorm', () => ({
    createConnection: jest.fn(() => Promise.resolve()),
}))
describe('repository functions work', () => {
    it('post calls postgres', () => {
        // when
        postRepository.post('the user', 'the title', 'the message!')

        // then
        expect(createConnection).toHaveBeenCalled()
    })
})
