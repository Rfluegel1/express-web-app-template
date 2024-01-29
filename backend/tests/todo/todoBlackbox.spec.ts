import Todo from '../../src/todos/Todo'
import {StatusCodes} from 'http-status-codes'
import {UUID_REG_EXP} from '../../src/contants'
import axios, {AxiosError} from 'axios'

jest.setTimeout(30000)

describe('Todo resource', () => {
    it('is created, fetched, updated, and deleted', async () => {
        // given
        const todo: Todo = new Todo('the task', 'the createdBy')
        const updateTodo: Todo = new Todo('the updated task', 'the updated createdBy')

        // when
        const postResponse = await axios.post(`${process.env.BASE_URL}/api/todos`, todo)

        // then
        expect(postResponse.status).toEqual(StatusCodes.CREATED)
        const postMessage = postResponse.data.message
        expect(postMessage.id).toMatch(UUID_REG_EXP)
        expect(postMessage.task).toEqual('the task')
        expect(postMessage.createdBy).toEqual('the createdBy')

        // when
        const id = postMessage.id
        const getResponse = await axios.get(`${process.env.BASE_URL}/api/todos/${id}`)

        // then
        expect(getResponse.status).toEqual(StatusCodes.OK)
        const getMessage = getResponse.data.message
        expect(getMessage.id).toEqual(id)
        expect(getMessage.task).toEqual('the task')
        expect(getMessage.createdBy).toEqual('the createdBy')

        // when
        const updateResponse = await axios.put(`${process.env.BASE_URL}/api/todos/${id}`, updateTodo)

        // then
        expect(updateResponse.status).toEqual(StatusCodes.OK)
        let updateMessage = updateResponse.data.message
        expect(updateMessage.id).toEqual(id)
        expect(updateMessage.task).toEqual('the updated task')
        expect(updateMessage.createdBy).toEqual('the updated createdBy')

        // when
        const deleteResponse = await axios.delete(`${process.env.BASE_URL}/api/todos/${id}`)

        // then
        expect(deleteResponse.status).toEqual(StatusCodes.NO_CONTENT)

        // when
        let getAfterDeleteResponse

        try {
            getAfterDeleteResponse = await axios.get(`${process.env.BASE_URL}/api/todos/${id}`)
        } catch (error) {
            getAfterDeleteResponse = (error as AxiosError).response
        }

        // then
        expect(getAfterDeleteResponse?.status).toEqual(StatusCodes.NOT_FOUND)
        expect(getAfterDeleteResponse?.data.message).toEqual(`Object not found for id=${id}`)
    })

    it('get all returns all posts createdBy the authenticated user', async () => {
        // given
        const firstTodo: Todo = new Todo('first task', 'authenticated createdBy')
        const secondTodo: Todo = new Todo('second task', 'authenticated createdBy')
        const otherTodo: Todo = new Todo('other task', 'other createdBy')
        const firstPostResponse = await axios.post(`${process.env.BASE_URL}/api/todos`, firstTodo)
        const secondPostResponse = await axios.post(`${process.env.BASE_URL}/api/todos`, secondTodo)
        const otherPostResponse = await axios.post(`${process.env.BASE_URL}/api/todos`, otherTodo)
        expect(firstPostResponse.status).toEqual(StatusCodes.CREATED)
        expect(secondPostResponse.status).toEqual(StatusCodes.CREATED)
        expect(otherPostResponse.status).toEqual(StatusCodes.CREATED)
        try {
            // when
            const getAllResponse = await axios.get(`${process.env.BASE_URL}/api/todos?createdBy=${encodeURIComponent('authenticated createdBy')}`)

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
            const firstDeleteResponse = await axios.delete(`${process.env.BASE_URL}/api/todos/${firstPostResponse.data.message.id}`)
            const secondDeleteResponse = await axios.delete(`${process.env.BASE_URL}/api/todos/${secondPostResponse.data.message.id}`)
            const otherDeleteResponse = await axios.delete(`${process.env.BASE_URL}/api/todos/${otherPostResponse.data.message.id}`)
            expect(firstDeleteResponse.status).toEqual(StatusCodes.NO_CONTENT)
            expect(secondDeleteResponse.status).toEqual(StatusCodes.NO_CONTENT)
            expect(otherDeleteResponse.status).toEqual(StatusCodes.NO_CONTENT)
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
})
