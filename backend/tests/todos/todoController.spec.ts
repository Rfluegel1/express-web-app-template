import TodoController from '../../../backend/src/todos/todoController'
import {v4 as uuidv4} from 'uuid'
import {StatusCodes} from 'http-status-codes'
import {NextFunction} from 'express'
import {NotFoundException} from '../../src/exceptions/NotFoundException'
import {BadRequestException} from '../../src/exceptions/BadRequestException'
import {DatabaseException} from '../../src/exceptions/DatabaseException'
import {UnauthorizedException} from '../../src/exceptions/UnauthorizedException'

// setup
jest.mock('../../src/todos/todoService', () => {
    return jest.fn().mockImplementation(() => {
        return {
            createTodo: jest.fn(),
            deleteTodo: jest.fn(),
            getTodosByCreatedBy: jest.fn(),
            getTodo: jest.fn(),
            updateTodo: jest.fn()
        }
    })
})

jest.mock('../../src/Logger', () => ({
    getLogger: jest.fn(() => {
        return {
            info: jest.fn()
        }
    })
}))

describe('Todo controller', () => {
    const todoController = new TodoController()
    it('createTodo responds with data that is returned from the TodoService', async () => {
        // given
        const mockTodo = {id: uuidv4(), task: 'the task', createdBy: 'the createdBy'}
        const request = {
            isAuthenticated: () => true,
            body: {task: 'the task'},
            user: {id: 'the createdBy'}
        }
        const response = {
            status: jest.fn(function () {
                return this
            }), send: jest.fn(),
        };

        (todoController.todoService.createTodo as jest.Mock).mockImplementation((task, createdBy) => {
            if (task === 'the task' && createdBy === 'the createdBy') {
                return mockTodo
            } else {
                return null
            }
        })

        // when
        await todoController.createTodo(request as any, response as any, jest.fn())

        // then
        expect(response.send).toHaveBeenCalledWith({message: mockTodo})
        expect(response.status).toHaveBeenCalledWith(StatusCodes.CREATED)
    })
    it.each`
    apiEndpoint              | controllerFunction
    ${'createTodo'}          | ${todoController.createTodo}
    ${'getTodo'}             | ${todoController.getTodo}
    ${'deleteTodo'}          | ${todoController.deleteTodo}
    ${'updateTodo'}          | ${todoController.updateTodo}
    ${'getTodosByCreatedBy'} | ${todoController.getTodosByCreatedBy}
    `('$apiEndpoint returns unauthorized when the request session is not authenticated', async (
        {apiEndpoint, controllerFunction}
    ) => {
        const request = {
            isAuthenticated: () => false
        }
        const response = {
            status: jest.fn(function () {
                return this
            }), send: jest.fn(),
        }
        const next = jest.fn()

        // when
        await controllerFunction(request as any, response as any, next)

        // then
        expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedException))
    })
    it('createTodo should next error that is returned from the TodoService', async () => {
        // given
        const request = {
            body: {task: 'the task'},
            user: {id: 'the createdBy'},
            isAuthenticated: () => true,
        }
        const response = {};

        (todoController.todoService.createTodo as jest.Mock).mockImplementation(() => {
            throw new DatabaseException()
        })
        const next: NextFunction = jest.fn()

        // when
        await todoController.createTodo(request as any, response as any, next)

        // then
        expect(next).toHaveBeenCalledWith(expect.any(DatabaseException))
    })
    it('updateTodo responds with data that is returned from the TodoService', async () => {
        // given
        let id = uuidv4()
        const mockTodo = {id: id, task: 'the task', createdBy: 'the createdBy'}
        const request = {
            params: {
                id: id
            },
            body: {
                task: 'the task',
                createdBy: undefined
            },
            isAuthenticated: () => true,
        }
        const response = {
            status: jest.fn(function () {
                return this
            }),
            send: jest.fn(),
        };

        (todoController.todoService.updateTodo as jest.Mock).mockImplementation((sentId, task, createdBy) => {
            if (sentId === id && task === 'the task' && createdBy === undefined) {
                return mockTodo
            } else {
                return null
            }
        })

        // when
        await todoController.updateTodo(request as any, response as any, jest.fn())

        // then
        expect(response.status).toHaveBeenCalledWith(StatusCodes.OK)
        expect(response.send).toHaveBeenCalledWith({message: mockTodo})
    })
    it('updateTodo should next error when id is not UUID', async () => {
        // given
        const request = {
            params: {id: 'undefined'},
            body: {
                task: 'the user',
                createdBy: undefined
            },
            isAuthenticated: () => true
        }
        const response = {}

        const next: NextFunction = jest.fn()

        // when
        await todoController.updateTodo(request as any, response as any, next)

        // then
        expect(next).toHaveBeenCalledWith(expect.any(BadRequestException))
    })
    it('getTodo responds with data that is returned from the TodoService', async () => {
        // given
        let id: string = uuidv4()
        const mockTodo = {id: id, task: 'the task', createdBy: 'the createdBy'}
        const request = {
            params: {id: id},
            isAuthenticated: () => true,
        }
        const response = {
            status: jest.fn(function () {
                return this
            }),
            send: jest.fn(),
        };

        (todoController.todoService.getTodo as jest.Mock).mockImplementation((sentId) => {
            if (id === sentId) {
                return mockTodo
            } else {
                return null
            }
        })

        // when
        await todoController.getTodo(request as any, response as any, jest.fn())

        // then
        expect(response.status).toHaveBeenCalledWith(StatusCodes.OK)
        expect(response.send).toHaveBeenCalledWith({message: mockTodo})
    })
    it('getTodo should next error that is returned from the TodoService', async () => {
        // given
        let id: string = uuidv4()
        const request = {
            isAuthenticated: () => true,
            params: {id: id},
        }
        const response = {};

        (todoController.todoService.getTodo as jest.Mock).mockImplementation(() => {
            throw new NotFoundException('id')
        })
        const next: NextFunction = jest.fn()

        // when
        await todoController.getTodo(request as any, response as any, next)

        // then
        expect(next).toHaveBeenCalledWith(expect.any(NotFoundException))
    })
    it('getTodo should next error when id is not UUID', async () => {
        // given
        const request = {
            isAuthenticated: () => true,
            params: {id: 'undefined'},
        }
        const response = {}

        const next: NextFunction = jest.fn()

        // when
        await todoController.getTodo(request as any, response as any, next)

        // then
        expect(next).toHaveBeenCalledWith(expect.any(BadRequestException))
    })

    it('getTodosByCreatedBy responds with data that is returned from the TodoService', async () => {
        // given
        let id: string = uuidv4()
        let id2: string = uuidv4()
        const mockTodo = {id: id, task: 'the task', createdBy: 'the createdBy'}
        const mockTodo2 = {id: id2, task: 'the task', createdBy: 'the createdBy'}
        const request = {
            isAuthenticated: () => true,
            query: {
                createdBy: 'the createdBy'
            }
        }
        const response = {
            status: jest.fn(function () {
                return this
            }),
            send: jest.fn(),
        };

        (todoController.todoService.getTodosByCreatedBy as jest.Mock).mockImplementation((createdBy: string) => {
            if (createdBy === 'the createdBy') {
                return [mockTodo, mockTodo2]
            } else {
                return null
            }
        })

        // when
        await todoController.getTodosByCreatedBy(request as any, response as any, jest.fn())

        // then
        expect(response.status).toHaveBeenCalledWith(StatusCodes.OK)
        expect(response.send).toHaveBeenCalledWith({message: [mockTodo, mockTodo2]})
    })
    it('getTodosByCreatedBy should next error that is returned from the TodoService', async () => {
        // given
        const request = {
            isAuthenticated: () => true,
            query: {
                createdBy: 'the createdBy'
            }
        }
        const response = {};

        (todoController.todoService.getTodosByCreatedBy as jest.Mock).mockImplementation(() => {
            throw new DatabaseException()
        })
        const next: NextFunction = jest.fn()

        // when
        await todoController.getTodosByCreatedBy(request as any, response as any, next)

        // then
        expect(next).toHaveBeenCalledWith(expect.any(DatabaseException))
    })

    it('deleteTodo should call service and respond with NO_CONTENT', async () => {
        // given
        let id: string = uuidv4()
        const request = {
            isAuthenticated: () => true,
            params: {id: id},
        }
        const response = {
            sendStatus: jest.fn(function () {
                return this
            })
        }

        // when
        await todoController.deleteTodo(request as any, response as any, jest.fn())

        // then
        expect(todoController.todoService.deleteTodo).toHaveBeenCalledWith(id)
        expect(response.sendStatus).toHaveBeenCalledWith(StatusCodes.NO_CONTENT)
    })
    it('deleteTodo should next error when id is not UUID', async () => {
        // given
        const request = {
            isAuthenticated: () => true,
            params: {id: 'undefined'},
        }
        const response = {}

        const next: NextFunction = jest.fn()

        // when
        await todoController.deleteTodo(request as any, response as any, next)

        // then
        expect(next).toHaveBeenCalledWith(expect.any(BadRequestException))
    })
})
