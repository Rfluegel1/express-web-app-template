import UserController from '../../../backend/src/users/userController'
import {v4 as uuidv4} from 'uuid'
import {StatusCodes} from 'http-status-codes'
import {NextFunction} from 'express'
import {NotFoundException} from '../../src/exceptions/NotFoundException'
import {BadRequestException} from '../../src/exceptions/BadRequestException'
import {DatabaseException} from '../../src/exceptions/DatabaseException'
import {UnauthorizedException} from '../../src/exceptions/UnauthorizedException'

// setup
jest.mock('../../src/users/userService', () => {
    return jest.fn().mockImplementation(() => {
        return {
            createUser: jest.fn(),
            deleteUser: jest.fn(),
            getUserByEmail: jest.fn(),
            getUser: jest.fn(),
            updateUser: jest.fn()
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

describe('User controller', () => {
    const user = {email: 'email', passwordHash: 'passwordHash', isVerified: false}
    const userController = new UserController()
    it('createUser responds with data that is returned from the UserService', async () => {
        // given
        const id = uuidv4()
        const mockUser = {id: id, email: 'email', password: 'password', isVerified: false}
        const request = {
            body: {email: 'email', password: 'password', confirmPassword: 'password'}
        }
        const response = {
            status: jest.fn(function () {
                return this
            }), send: jest.fn(),
        };

        (userController.userService.createUser as jest.Mock).mockImplementation((email, password) => {
            if (email === 'email' && password === 'password') {
                return mockUser
            } else {
                return null
            }
        })

        // when
        await userController.createUser(request as any, response as any, jest.fn())

        // then
        expect(response.send).toHaveBeenCalledWith({id: id, email: 'email', isVerified: false})
        expect(response.status).toHaveBeenCalledWith(StatusCodes.CREATED)
    })
    it('createUser should next error that is returned from the UserService', async () => {
        // given
        const request = {
            body: {task: 'the task'},
            oidc: {user: {sid: 'the createdBy'}}
        }
        const response = {};

        (userController.userService.createUser as jest.Mock).mockImplementation(() => {
            throw new DatabaseException()
        })
        const next: NextFunction = jest.fn()

        // when
        await userController.createUser(request as any, response as any, next)

        // then
        expect(next).toHaveBeenCalledWith(expect.any(DatabaseException))
    })

    it('createUser should next Bad Request when password and confirmPassword do no match', async () => {
        // given
        const request = {
            body: {password: 'password', confirmPassword: 'other'}
        };
        const response = {};

        const next: NextFunction = jest.fn()

        // when
        await userController.createUser(request as any, response as any, next)

        // then
        expect(next).toHaveBeenCalledWith(expect.any(BadRequestException))
    })

    it('updateUser should next Bad Request when password and confirmPassword do no match', async () => {
        // given
        let id = uuidv4();
        const request = {
            body: {password: 'password', confirmPassword: 'other'},
            isAuthenticated: () => true,
            params: {id: id},
            user: {id: id}
        };
        const response = {};

        const next: NextFunction = jest.fn()

        // when
        await userController.updateUser(request as any, response as any, next)

        // then
        expect(next).toHaveBeenCalledWith(expect.any(BadRequestException))
    })
    it('getUser responds with data that is returned from the UserService', async () => {
        // given
        let id: string = uuidv4()
        const mockUser = {id: id, ...user}
        const request = {
            params: {id: id},
            isAuthenticated: () => true,
            user: {id: id}
        }
        const response = {
            status: jest.fn(function () {
                return this
            }),
            send: jest.fn(),
        };

        (userController.userService.getUser as jest.Mock).mockImplementation((sentId) => {
            if (id === sentId) {
                return mockUser
            } else {
                return null
            }
        })

        // when
        await userController.getUser(request as any, response as any, jest.fn())

        // then
        expect(response.status).toHaveBeenCalledWith(StatusCodes.OK)
        expect(response.send).toHaveBeenCalledWith({id: mockUser.id, email: mockUser.email, isVerified: mockUser.isVerified})
    })
    it('getUser should next error that is returned from the UserService', async () => {
        // given
        let id: string = uuidv4()
        const request = {
            params: {id: id},
            isAuthenticated: () => true,
            user: {id: id}
        }
        const response = {};

        (userController.userService.getUser as jest.Mock).mockImplementation(() => {
            throw new NotFoundException(id)
        })
        const next: NextFunction = jest.fn()

        // when
        await userController.getUser(request as any, response as any, next)

        // then
        expect(next).toHaveBeenCalledWith(expect.any(NotFoundException))
    })
    it('getUser should next error when id is not UUID', async () => {
        // given
        const request = {
            isAuthenticated: () => true,
            params: {id: 'undefined'},
            user: {id: 'undefined'}
        }
        const response = {}

        const next: NextFunction = jest.fn()

        // when
        await userController.getUser(request as any, response as any, next)

        // then
        expect(next).toHaveBeenCalledWith(expect.any(BadRequestException))
    })
    it('getUserByEmail responds with data that is returned from the UserService', async () => {
        // given
        let id: string = uuidv4()
        const mockUser = {id: id, ...user}
        const request = {
            isAuthenticated: () => true,
            query: {email: user.email},
        }
        const response = {
            status: jest.fn(function () {
                return this
            }),
            send: jest.fn(),
        };

        (userController.userService.getUserByEmail as jest.Mock).mockImplementation((email) => {
            if (user.email === email) {
                return mockUser
            } else {
                return null
            }
        })

        // when
        await userController.getUserByEmail(request as any, response as any, jest.fn())

        // then
        expect(response.status).toHaveBeenCalledWith(StatusCodes.OK)
        expect(response.send).toHaveBeenCalledWith({id: mockUser.id, email: mockUser.email, isVerified: mockUser.isVerified})
    })
    it('getUserByEmail should next error that is returned from the UserService', async () => {
        // given
        const request = {
            query: {email: user.email},
        }
        const response = {};

        (userController.userService.getUserByEmail as jest.Mock).mockImplementation(() => {
            throw new NotFoundException(user.email)
        })
        const next: NextFunction = jest.fn()

        // when
        await userController.getUserByEmail(request as any, response as any, next)

        // then
        expect(next).toHaveBeenCalledWith(expect.any(NotFoundException))
    })
    it('deleteUser should call service and respond with NO_CONTENT', async () => {
        // given
        let id: string = uuidv4()
        const request = {
            isAuthenticated: () => true,
            user: {id: id},
            params: {id: id},
        }
        const response = {
            sendStatus: jest.fn(function () {
                return this
            })
        }

        // when
        await userController.deleteUser(request as any, response as any, jest.fn())

        // then
        expect(userController.userService.deleteUser).toHaveBeenCalledWith(id)
        expect(response.sendStatus).toHaveBeenCalledWith(StatusCodes.NO_CONTENT)
    })
    it('deleteUser should next error when id is not UUID', async () => {
        // given
        const request = {
            isAuthenticated: () => true,
            user: {id: 'undefined'},
            params: {id: 'undefined'},
        }
        const response = {}

        const next: NextFunction = jest.fn()

        // when
        await userController.deleteUser(request as any, response as any, next)

        // then
        expect(next).toHaveBeenCalledWith(expect.any(BadRequestException))
    })
    it('updateUser responds with data that is returned from the UserService', async () => {
        // given
        let id = uuidv4()
        const mockUser = {id: id, ...user}
        const request = {
            isAuthenticated: () => true,
            user: {id: id},
            params: {id: id},
            body: {email: 'email', password: undefined},
        }
        const response = {
            status: jest.fn(function () {
                return this
            }),
            send: jest.fn(),
        };

        (userController.userService.updateUser as jest.Mock).mockImplementation(
            (sentId, email, passwordHash) => {
                if (sentId === id && email === 'email' && passwordHash === undefined) {
                    return mockUser
                } else {
                    return null
                }
            }
        )

        // when
        await userController.updateUser(request as any, response as any, jest.fn())

        // then
        expect(response.status).toHaveBeenCalledWith(StatusCodes.OK)
        expect(response.send).toHaveBeenCalledWith({id: mockUser.id, email: mockUser.email, isVerified: mockUser.isVerified})
    })
    it('updateUser should next error when id is not UUID', async () => {
        // given
        const request = {
            isAuthenticated: () => true,
            user: {id: 'undefined'},
            params: {id: 'undefined'},
            body: {
                task: 'the user',
                createdBy: undefined
            },
        }
        const response = {}

        const next: NextFunction = jest.fn()

        // when
        await userController.updateUser(request as any, response as any, next)

        // then
        expect(next).toHaveBeenCalledWith(expect.any(BadRequestException))
    })
    it.each`
    apiEndpoint              | controllerFunction
    ${'getUser'}             | ${userController.getUser}
    ${'deleteUser'}          | ${userController.deleteUser}
    ${'updateUser'}          | ${userController.updateUser}
    `('$apiEndpoint returns unauthorized when the request session is not authenticated', async (
        {apiEndpoint, controllerFunction}
    ) => {
        const request = {
            user: {id: 'who cares'},
            params: {id: 'who cares'},
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

    it.each`
    apiEndpoint              | controllerFunction
    ${'getUser'}             | ${userController.getUser}
    ${'deleteUser'}          | ${userController.deleteUser}
    ${'updateUser'}          | ${userController.updateUser}
    `('$apiEndpoint returns unauthorized when auth user id does not match param id', async (
        {apiEndpoint, controllerFunction}
    ) => {
        const request = {
            isAuthenticated: () => true,
            user: {id: 'user'},
            params: {id: 'other'},
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

    it('isVerified should getUser from service and return OK and isVerified', async () => {
        // given
        let id: string = uuidv4()
        const mockUser = {id: id, ...user}
        let request = {
            user: {id: id}
        }
        const response = {
            status: jest.fn(function () {
                return this
            }), send: jest.fn(),
        };
        (userController.userService.getUser as jest.Mock).mockImplementation((sentId) => {
            if (id === sentId) {
                return mockUser
            } else {
                return null
            }
        })

        // when
        await userController.isVerified(request as any, response as any, jest.fn())

        // then
        expect(response.send).toHaveBeenCalledWith({isVerified: user.isVerified})
        expect(response.status).toHaveBeenCalledWith(StatusCodes.OK)
    })
})

