import Post from '../../src/posts/post'
import {StatusCodes} from 'http-status-codes'
import {UUID_REG_EXP} from '../../src/contants'

const axios = require('axios')

describe('Post Lifecycle', () => {
    it('is created, fetched, updated, and deleted', async () => {
        // given
        const post = new Post('theUser', 'theTitle', 'theBody')
        const updatePost = new Post('theUpdatedUser', 'theUpdatedTitle', 'theUpdatedBody')

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
        let getMessage = getResponse.data.message
        expect(getMessage.id).toEqual(id)
        expect(getMessage.userId).toEqual('theUser')
        expect(getMessage.title).toEqual('theTitle')
        expect(getMessage.body).toEqual('theBody')

        // when
        const updateResponse = await axios.put(`http://127.0.0.1:8080/posts/${id}`, updatePost)

        // then
        expect(updateResponse.status).toEqual(StatusCodes.OK)
        let updateMessage = updateResponse.data.message
        expect(updateMessage.id).toEqual(id)
        expect(updateMessage.userId).toEqual('theUpdatedUser')
        expect(updateMessage.title).toEqual('theUpdatedTitle')
        expect(updateMessage.body).toEqual('theUpdatedBody')

        // when
        const deleteResponse = await axios.delete(`http://127.0.0.1:8080/posts/${id}`)

        // then
        expect(deleteResponse.status).toEqual(StatusCodes.NO_CONTENT)

        // when
        const getAfterDeleteResponse = await axios.get(`http://127.0.0.1:8080/posts/${id}`)

        // then
        expect(getAfterDeleteResponse.status).toEqual(StatusCodes.NOT_FOUND)
    })
})
