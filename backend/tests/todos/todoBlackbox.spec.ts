import Todo from '../../src/todos/Todo'
import {StatusCodes} from 'http-status-codes'
import {UUID_REG_EXP} from '../../src/contants'
import axios, {AxiosError} from 'axios'
import {wrapper} from 'axios-cookiejar-support'
import {CookieJar} from 'tough-cookie'

const jar = new CookieJar();
const client = wrapper(axios.create({ jar, withCredentials: true }));

jest.setTimeout(30000)

describe('Todo resource', () => {
    async function loginTestUser() {
        const email = 'cypressdefault@gmail.com'
        const password = 'pass_good'

        try {
            await client.get(`${process.env.BASE_URL}/api/users?email=${email}`)
        } catch (error) {
            if ((error as AxiosError)?.response?.status === StatusCodes.NOT_FOUND) {
                const createResponse = await client.post(`${process.env.BASE_URL}/api/users`, {
                    email: email, password: password
                })
                expect(createResponse.status).toEqual(StatusCodes.CREATED)
            } else {
                throw error
            }
        }

        const data = new URLSearchParams()
        data.append('username', email)
        data.append('password', password)
        return await client.post(`${process.env.BASE_URL}/api/login`, data, {
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        })
    }

    it('is created, fetched, updated, and deleted', async () => {
        // given
        const loginResponse = await loginTestUser()
        expect(loginResponse.status).toEqual(StatusCodes.OK);
        let postData = loginResponse.data;
        expect(postData).toContain('href="/"');

        // given
        const todo: Todo = new Todo('the task', 'the createdBy')
        const updateTodo: Todo = new Todo('the updated task', 'the updated createdBy')

        // when
        const postResponse = await client.post(`${process.env.BASE_URL}/api/todos`, todo)

        // then
        expect(postResponse.status).toEqual(StatusCodes.CREATED)
        const postMessage = postResponse.data.message
        expect(postMessage.id).toMatch(UUID_REG_EXP)
        expect(postMessage.task).toEqual('the task')
        expect(postMessage.createdBy).toEqual('the createdBy')

        // when
        const id = postMessage.id
        const getResponse = await client.get(`${process.env.BASE_URL}/api/todos/${id}`)

        // then
        expect(getResponse.status).toEqual(StatusCodes.OK)
        const getMessage = getResponse.data.message
        expect(getMessage.id).toEqual(id)
        expect(getMessage.task).toEqual('the task')
        expect(getMessage.createdBy).toEqual('the createdBy')

        // when
        const updateResponse = await client.put(`${process.env.BASE_URL}/api/todos/${id}`, updateTodo)

        // then
        expect(updateResponse.status).toEqual(StatusCodes.OK)
        let updateMessage = updateResponse.data.message
        expect(updateMessage.id).toEqual(id)
        expect(updateMessage.task).toEqual('the updated task')
        expect(updateMessage.createdBy).toEqual('the updated createdBy')

        // when
        const deleteResponse = await client.delete(`${process.env.BASE_URL}/api/todos/${id}`)

        // then
        expect(deleteResponse.status).toEqual(StatusCodes.NO_CONTENT)

        // when
        let getAfterDeleteResponse

        try {
            getAfterDeleteResponse = await client.get(`${process.env.BASE_URL}/api/todos/${id}`)
        } catch (error) {
            getAfterDeleteResponse = (error as AxiosError).response
        }

        // then
        expect(getAfterDeleteResponse?.status).toEqual(StatusCodes.NOT_FOUND)
        expect(getAfterDeleteResponse?.data.message).toEqual(`Object not found for id=${id}`)

        // cleanup
        await client.post(`${process.env.BASE_URL}/api/logout`)
    })

    it('get all returns all posts createdBy the authenticated user', async () => {
        // given
        const loginResponse = await loginTestUser()
        expect(loginResponse.status).toEqual(StatusCodes.OK);
        let postData = loginResponse.data;
        expect(postData).toContain('href="/"');

        // given
        const firstTodo: Todo = new Todo('first task', 'authenticated createdBy')
        const secondTodo: Todo = new Todo('second task', 'authenticated createdBy')
        const otherTodo: Todo = new Todo('other task', 'other createdBy')
        const firstPostResponse = await client.post(`${process.env.BASE_URL}/api/todos`, firstTodo)
        const secondPostResponse = await client.post(`${process.env.BASE_URL}/api/todos`, secondTodo)
        const otherPostResponse = await client.post(`${process.env.BASE_URL}/api/todos`, otherTodo)
        expect(firstPostResponse.status).toEqual(StatusCodes.CREATED)
        expect(secondPostResponse.status).toEqual(StatusCodes.CREATED)
        expect(otherPostResponse.status).toEqual(StatusCodes.CREATED)
        try {
            // when
            const getAllResponse = await client.get(`${process.env.BASE_URL}/api/todos?createdBy=${encodeURIComponent('authenticated createdBy')}`)

            // then
            expect(getAllResponse.status).toEqual(StatusCodes.OK)
            let todos = getAllResponse.data.message

            let foundFirst = todos.find((todo: Todo): boolean => todo.id === firstPostResponse.data.message.id)
            expect(foundFirst.task).toEqual('first task')
            expect(foundFirst.createdBy).toEqual('authenticated createdBy')

            let foundSecond = todos.find((todo: Todo): boolean => todo.id === secondPostResponse.data.message.id)
            expect(foundSecond.task).toEqual('second task')
            expect(foundSecond.createdBy).toEqual('authenticated createdBy')

            let foundOther = todos.find((todo: Todo): boolean => todo.id === otherPostResponse.data.message.id)
            expect(foundOther).toEqual(undefined)
        } finally {
            // cleanup
            const firstDeleteResponse = await client.delete(`${process.env.BASE_URL}/api/todos/${firstPostResponse.data.message.id}`)
            const secondDeleteResponse = await client.delete(`${process.env.BASE_URL}/api/todos/${secondPostResponse.data.message.id}`)
            const otherDeleteResponse = await client.delete(`${process.env.BASE_URL}/api/todos/${otherPostResponse.data.message.id}`)
            expect(firstDeleteResponse.status).toEqual(StatusCodes.NO_CONTENT)
            expect(secondDeleteResponse.status).toEqual(StatusCodes.NO_CONTENT)
            expect(otherDeleteResponse.status).toEqual(StatusCodes.NO_CONTENT)
            await client.post(`${process.env.BASE_URL}/api/logout`)
        }
    })
    it('non uuid returns bad request and info', async () => {
        // when
        let getResponse
        try {
            getResponse = await axios.get(`${process.env.BASE_URL}/api/todos/undefined`)
        } catch (error) {
            getResponse = (error as AxiosError).response
        }
        // then
        expect(getResponse?.status).toEqual(StatusCodes.BAD_REQUEST)
        expect(getResponse?.data.message).toEqual('Parameter id not of type UUID for id=undefined')
    })
    it('create should be disabled when auth session not found', async () => {
        // given
        const todo: Todo = new Todo('the task', 'the createdBy')
        let postResponse

        // when
        try {
            postResponse = await axios.post(`${process.env.BASE_URL}/api/todos`, todo)
        } catch (e) {
            postResponse = (e as AxiosError).response
        }

        // then
        expect(postResponse?.status).toEqual(StatusCodes.UNAUTHORIZED)
        const postMessage = postResponse?.data.message
        expect(postMessage.message).toEqual('Unauthorized: You must be logged in to create a Todo.')
    })
})
