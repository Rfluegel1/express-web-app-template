import {NextFunction, Request, Response} from 'express'
import {StatusCodes} from 'http-status-codes'
import {UUID_REG_EXP} from '../contants'
import {BadRequestException} from '../exceptions/BadRequestException'
import {getLogger} from '../Logger'
import UserService from './userService'
import User from './User'
import {UnauthorizedException} from '../exceptions/UnauthorizedException'

export default class UserController {
    userService = new UserService()

    async updateUser(request: Request, response: Response, next: NextFunction) {
        getLogger().info(
            'Received update users request',
            {requestParam: request.params, requestBody: request.body}
        )
        const id: string = request.params.id
        if (!request.isAuthenticated() || (request.user as User).id !== id) {
            next(new UnauthorizedException('update user'))
            return
        }
        const email: string = request.body.email
        const password: string = request.body.password
        let confirmPassword: string = request.body.confirmPassword
        if (password !== confirmPassword) {
            next(new BadRequestException())
            return
        }
        if (!id.match(UUID_REG_EXP)) {
            return next(new BadRequestException(id))
        }
        try {
            let user: User = await this.userService.updateUser(id, email, password)
            getLogger().info('Sending update user request', {status: StatusCodes.OK})
            return response.status(StatusCodes.OK).send({
                id: user.id, email: user.email, isVerified: user.isVerified
            })
        } catch (error) {
            next(error)
        }
    }

    async createUser(request: Request, response: Response, next: NextFunction) {
        let email: string = request.body.email
        getLogger().info('Received create users request', {requestBody: {email: email}})
        let password: string = request.body.password
        let confirmPassword: string = request.body.confirmPassword
        if (password !== confirmPassword) {
            next(new BadRequestException())
            return
        }
        try {
            const user: User = await this.userService.createUser(email, password)
            getLogger().info('Sending create users response', {status: StatusCodes.CREATED})
            return response.status(StatusCodes.CREATED).send({
                id: user.id, email: user.email, isVerified: user.isVerified
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteUser(request: Request, response: Response, next: NextFunction) {
        getLogger().info('Received delete users request', {requestParam: request.params})
        let id: string = request.params.id
        if ((!request.isAuthenticated() || (request.user as User).id !== id) && (request.user as User).role !== 'admin'){
            next(new UnauthorizedException('delete user'))
            return
        }
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
        if (!request.isAuthenticated() || (request.user as User).id !== id) {
            next(new UnauthorizedException('get user'))
            return
        }
        let user: User
        if (!id.match(UUID_REG_EXP)) {
            return next(new BadRequestException(id))
        }
        try {
            user = await this.userService.getUser(id)
            getLogger().info('Sending get users response', {status: StatusCodes.OK})
            return response.status(StatusCodes.OK).send({
                id: user.id, email: user.email, isVerified: user.isVerified
            })
        } catch (error) {
            next(error)
        }
    }

    async getUserByEmail(request: Request, response: Response, next: NextFunction) {
        getLogger().info('Received get user by email request', {requestQuery: request.query})
        let email: string = request.query.email as string
        let user: User
        try {
            user = await this.userService.getUserByEmail(email)
            getLogger().info('Sending get users response', {status: StatusCodes.OK})
            return response.status(StatusCodes.OK).send({
                id: user.id, email: user.email, isVerified: user.isVerified
            })
        } catch (error) {
            next(error)
        }
    }

    async isVerified(request: Request, response: Response, next: NextFunction) {
        getLogger().info('Received isVerified request')
        const userId = (request.user as User).id
        const user = await this.userService.getUser(userId)
        return response.status(StatusCodes.OK).send({isVerified: user.isVerified})
    }
}