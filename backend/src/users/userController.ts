import {NextFunction, Request, Response} from 'express'
import {StatusCodes} from 'http-status-codes'
import {UUID_REG_EXP} from '../contants'
import {BadRequestException} from '../exceptions/badRequestException'
import {getLogger} from '../Logger'
import UserService from './userService'
import User from './User'

export default class UserController {
    userService = new UserService()
    async createUser(request: Request, response: Response, next: NextFunction) {
        let email: string = request.body.email
        getLogger().info('Received create users request', {requestBody: {email: email}})
        let password: string = request.body.password
        try {
            const user: User = await this.userService.createUser(email, password)
            getLogger().info('Sending create users response', {status: StatusCodes.CREATED})
            return response.status(StatusCodes.CREATED).send({
                id: user.id, email: user.email
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteUser(request: Request, response: Response, next: NextFunction) {
        getLogger().info('Received delete users request', {requestParam: request.params})
        let id: string = request.params.id
        if (!id.match(UUID_REG_EXP)) {
            return next(new BadRequestException(id))
        }
        try {
            await this.userService.deleteUser(id)
            getLogger().info('Sending delete users response', {status: StatusCodes.NO_CONTENT})
            return response.sendStatus(StatusCodes.NO_CONTENT)
        } catch (error) {
            next(error)
        }
    }

    async getUser(request: Request, response: Response, next: NextFunction) {
        getLogger().info('Received get users request', {requestParam: request.params})
        let id: string = request.params.id
        let user: User
        if (!id.match(UUID_REG_EXP)) {
            return next(new BadRequestException(id))
        }
        try {
            user = await this.userService.getUser(id)
            getLogger().info('Sending get users response', {status: StatusCodes.OK})
            return response.status(StatusCodes.OK).send({
                id: user.id, email: user.email
            })
        } catch (error) {
            next(error)
        }
    }
}

