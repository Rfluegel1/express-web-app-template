import Post from '../../src/posts/post'
import {StatusCodes} from 'http-status-codes'
import {UUID_REG_EXP} from '../../src/contants'
import axios, {AxiosError} from 'axios'

require('../postTableSetup')

describe('Post resource', () => {
    it('is created, fetched, updated, and deleted', async () => {
        // given
        const post: Post = new Post('theUser', 'theTitle', 'theBody')
        const updatePost: Post = new Post('theUpdatedUser', 'theUpdatedTitle', 'theUpdatedBody')

        // when
        const postResponse = await axios.post('http://127.0.0.1:8080/posts', post)

        // then
        expect(postResponse.status).toEqual(StatusCodes.CREATED)
        const postMessage = postResponse.data.message
        expect(postMessage.id).toMatch(UUID_REG_EXP)
        expect(postMessage.userId).toEqual('theUser')
        expect(postMessage.title).toEqual('theTitle')
        expect(postMessage.body).toEqual('theBody')

        // when
        const id = postMessage.id
        const getResponse = await axios.get(`http://127.0.0.1:8080/posts/${id}`)

        // then
        expect(getResponse.status).toEqual(StatusCodes.OK)
        const getMessage = getResponse.data.message
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
        let getAfterDeleteResponse

        try {
            getAfterDeleteResponse = await axios.get(`http://127.0.0.1:8080/posts/${id}`)
        } catch (error) {
            getAfterDeleteResponse = (error as AxiosError).response
        }

        // then
        expect(getAfterDeleteResponse?.status).toEqual(StatusCodes.NOT_FOUND)
        expect(getAfterDeleteResponse?.data.message).toEqual(`Object not found for id=${id}`)
    })

    it('get all returns all posts', async () => {
        // given
        const firstPost: Post = new Post('theFirstUser', 'theFirstTitle', 'theFirstBody')
        const secondPost: Post = new Post('theSecondUser', 'theSecondTitle', 'theSecondBody')
        const firstPostResponse = await axios.post('http://127.0.0.1:8080/posts', firstPost)
        const secondPostResponse = await axios.post('http://127.0.0.1:8080/posts', secondPost)
        expect(firstPostResponse.status).toEqual(StatusCodes.CREATED)
        expect(secondPostResponse.status).toEqual(StatusCodes.CREATED)
        try {
            // when
            const getAllResponse = await axios.get('http://127.0.0.1:8080/posts')

            // then
            expect(getAllResponse.status).toEqual(StatusCodes.OK)
            let posts = getAllResponse.data.message

            let foundFirst = posts.find((post: Post): boolean => post.id === firstPostResponse.data.message.id)
            expect(foundFirst.userId).toEqual('theFirstUser')
            expect(foundFirst.title).toEqual('theFirstTitle')
            expect(foundFirst.body).toEqual('theFirstBody')

            let foundSecond = posts.find((post: Post): boolean => post.id === secondPostResponse.data.message.id)
            expect(foundSecond.userId).toEqual('theSecondUser')
            expect(foundSecond.title).toEqual('theSecondTitle')
            expect(foundSecond.body).toEqual('theSecondBody')
        } finally {
            // cleanup
            const firstDeleteResponse = await axios.delete(`http://127.0.0.1:8080/posts/${firstPostResponse.data.message.id}`)
            const secondDeleteResponse = await axios.delete(`http://127.0.0.1:8080/posts/${secondPostResponse.data.message.id}`)
            expect(firstDeleteResponse.status).toEqual(StatusCodes.NO_CONTENT)
            expect(secondDeleteResponse.status).toEqual(StatusCodes.NO_CONTENT)
        }
    })
    it('non uuid returns bad request and info', async () => {
        // when
        let getResponse
        try {
            getResponse = await axios.get('http://127.0.0.1:8080/posts/undefined')
        } catch (error) {
            getResponse = (error as AxiosError).response
        }
        // then
        expect(getResponse?.status).toEqual(StatusCodes.BAD_REQUEST)
        expect(getResponse?.data.message).toEqual('Parameter id not of type UUID for id=undefined')
    })
})
