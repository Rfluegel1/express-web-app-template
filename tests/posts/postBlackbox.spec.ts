import Post from '../../src/posts/post'
import {StatusCodes} from 'http-status-codes'
import {UUID_REG_EXP} from '../../src/contants'

const axios = require('axios')

describe('Post Lifecycle', () => {
    it('is created, fetched, updated, and deleted', async () => {
        // given
        const post = new Post('theUser', 'theTitle', 'theBody')

        // when
        const postResponse = await axios.post('http://127.0.0.1:8080/posts', post)

        // then
        expect(postResponse.status).toEqual(StatusCodes.CREATED)
        let postMessage = postResponse.data.message
        expect(postMessage.id).toMatch(UUID_REG_EXP)
        expect(postMessage.userId).toEqual('theUser')
        expect(postMessage.title).toEqual('theTitle')
        expect(postMessage.body).toEqual('theBody')

        // when
        const id = postMessage.id
        const getResponse = await axios.get(`http://127.0.0.1:8080/posts/${id}`)

        // then
        expect(getResponse.status).toEqual(StatusCodes.OK)
        let getMessage = getResponse.data.message[0]
        expect(getMessage.id).toEqual(id)
        expect(getMessage.userId).toEqual('theUser')
        expect(getMessage.title).toEqual('theTitle')
        expect(getMessage.body).toEqual('theBody')
    })
})
