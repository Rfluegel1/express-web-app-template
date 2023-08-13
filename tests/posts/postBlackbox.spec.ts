import Post from '../../src/posts/post'
import {StatusCodes} from 'http-status-codes'
import {UUID_REG_EXP} from '../../src/contants'
import {AxiosError} from 'axios'
import * as fs from 'fs'
import {DataSource} from 'typeorm'
import {ChildProcessWithoutNullStreams, spawn} from 'child_process'

const axios = require('axios')

const dataSource = new DataSource({
    'type': 'postgres',
    'host': 'localhost',
    'port': 5432,
    'username': 'reidfluegel',
    'password': 'asd',
    'database': 'post',
    'synchronize': true,
    'entities': [
        'src/entity/**/*.ts'
    ]
})
let server: ChildProcessWithoutNullStreams

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

beforeAll(async () => {
    server = spawn('npm', ['run', 'dev'])
    await sleep(3000)
    // Create the post table
    const sql = fs.readFileSync(
        '/Users/reidfluegel/workspaces/typescript-template/src/migrations.sql',
        'utf8'
    )
    await dataSource.initialize()
    try {
        await dataSource.query(sql)
    } catch (error) {
        if (error.message !== 'relation "posts" already exists') {
            throw error
        }
    }
})

afterAll(async () => {
    server.kill()
    await dataSource.destroy()
})
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
        let getAfterDeleteResponse

        try {
            getAfterDeleteResponse = await axios.get(`http://127.0.0.1:8080/posts/${id}`)
        } catch (error) {
            getAfterDeleteResponse = (error as AxiosError).response
        }

        // then
        expect(getAfterDeleteResponse.status).toEqual(StatusCodes.NOT_FOUND)
        expect(getAfterDeleteResponse.data.message).toEqual(`Object not found for id=${id}`)
    })

    it('get all returns all posts', async () => {
        // given
        const firstPost = new Post('theFirstUser', 'theFirstTitle', 'theFirstBody')
        const secondPost = new Post('theSecondUser', 'theSecondTitle', 'theSecondBody')
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
            let foundFirst = posts.find((post: Post) => post.id === firstPostResponse.data.message.id)
            expect(foundFirst.userId).toEqual('theFirstUser')
            expect(foundFirst.title).toEqual('theFirstTitle')
            expect(foundFirst.body).toEqual('theFirstBody')
            let foundSecond = posts.find((post: Post) => post.id === secondPostResponse.data.message.id)
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
        expect(getResponse.status).toEqual(StatusCodes.BAD_REQUEST)
        expect(getResponse.data.message).toEqual('Parameter id not of type UUID for id=undefined')
    })
})
