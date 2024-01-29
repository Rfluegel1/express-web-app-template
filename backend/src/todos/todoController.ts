import {NextFunction, Request, Response} from 'express'
import {StatusCodes} from 'http-status-codes'
import {UUID_REG_EXP} from '../contants'
import {BadRequestException} from '../exceptions/badRequestException'
import {getLogger} from '../Logger'
import TodoService from './todoService'
import Todo from './Todo'

export default class TodoController {
    todoService = new TodoService()
    async createTodo(request: Request, response: Response, next: NextFunction) {
        getLogger().info('Received create todo request', {requestBody: request.body})
        let task: string = request.body.task
        let createdBy: string = request.body.createdBy
        try {
            const todo: Todo = await this.todoService.createTodo(task, createdBy)
            getLogger().info('Sending create todo response', {status: StatusCodes.CREATED})
            return response.status(StatusCodes.CREATED).send({
                message: todo
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteTodo(request: Request, response: Response, next: NextFunction) {
        getLogger().info('Received delete todo request', {requestParam: request.params})
        let id: string = request.params.id
        if (!id.match(UUID_REG_EXP)) {
            return next(new BadRequestException(id))
        }
        try {
            await this.todoService.deleteTodo(id)
            getLogger().info('Sending delete todo response', {status: StatusCodes.NO_CONTENT})
            return response.sendStatus(StatusCodes.NO_CONTENT)
        } catch (error) {
            next(error)
        }
    }

    async getTodo(request: Request, response: Response, next: NextFunction) {
        getLogger().info('Received get todo request', {requestParam: request.params})
        let id: string = request.params.id
        let todo: Todo
        if (!id.match(UUID_REG_EXP)) {
            return next(new BadRequestException(id))
        }
        try {
            todo = await this.todoService.getTodo(id)
            getLogger().info('Sending get todo response', {status: StatusCodes.OK})
            return response.status(StatusCodes.OK).send({
                message: todo
            })
        } catch (error) {
            next(error)
        }
    }

    async getTodosByCreatedBy(request: Request, response: Response, next: NextFunction) {
        getLogger().info('Received get all todos request')
        let createdBy: any = request.query.createdBy
        try {
            const todos: Todo[] = await this.todoService.getTodosByCreatedBy(createdBy)
            getLogger().info('Sending get all todos request', {status: StatusCodes.OK})
            return response.status(StatusCodes.OK).send({
                message: todos
            })
        } catch (error) {
            next(error)
        }
    }

    async updateTodo(request: Request, res: Response, next: NextFunction) {
        getLogger().info('Received update todo request', {requestParam: request.params, requestBody: request.body})
        const id: string = request.params.id
        const task: string = request.body.task
        const createdBy: string = request.body.createdBy
        if (!id.match(UUID_REG_EXP)) {
            return next(new BadRequestException(id))
        }
        try {
            let todo: Todo = await this.todoService.updateTodo(id, task, createdBy)
            getLogger().info('Sending update todo request', {status: StatusCodes.OK})
            return res.status(StatusCodes.OK).send({
                message: todo
            })
        } catch (error) {
            next(error)
        }
    }
}

