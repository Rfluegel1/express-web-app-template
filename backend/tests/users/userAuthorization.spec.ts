import { UnauthorizedException } from '../../src/exceptions/UnauthorizedException';
import { v4 as uuidv4 } from 'uuid';
import { StatusCodes } from 'http-status-codes';
import UserController from '../../src/users/userController';

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
	it.each`
    apiEndpoint              | controllerFunction
    ${'getUser'}             | ${userController.getUser}
    ${'deleteUser'}          | ${userController.deleteUser}
    ${'updateUser'}          | ${userController.updateUser}
    ${'getUserByEmail'}      | ${userController.getUserByEmail}
    `('$apiEndpoint returns unauthorized when the request session is not authenticated', async (
		{ apiEndpoint, controllerFunction }
	) => {
		const request = {
			user: { id: 'who cares' },
			params: { id: 'who cares' },
			query: {email: 'who cares'},
			isAuthenticated: () => false
		}
		const response = {
			status: jest.fn(function() {
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
		{ apiEndpoint, controllerFunction }
	) => {
		const request = {
			isAuthenticated: () => true,
			user: { id: 'user' },
			params: { id: 'other' },
		}
		const response = {
			status: jest.fn(function() {
				return this
			}), send: jest.fn(),
		}
		const next = jest.fn()

		// when
		await controllerFunction(request as any, response as any, next)

		// then
		expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedException))
	})

	it('getUserByEmail returns unauthorized when auth user email does not match query email', async () => {
		// given
		const request = {
			isAuthenticated: () => true,
			user: { email: 'user' },
			query: { email: 'other' },
		}
		const response = {
			status: jest.fn(function() {
				return this
			}), send: jest.fn(),
		}
		const next = jest.fn()

		// when
		await userController.getUserByEmail(request as any, response as any, next)

		// then
		expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedException))
	})

	it('deleteUser should function normally when called by admin', async () => {
		// given
		let id: string = uuidv4()
		const request = {
			isAuthenticated: () => true,
			user: { id: 'other', role: 'admin' },
			params: { id: id },
		}
		const response = {
			sendStatus: jest.fn(function() {
				return this
			})
		}

		// when
		await userController.deleteUser(request as any, response as any, jest.fn())

		// then
		expect(userController.userService.deleteUser).toHaveBeenCalledWith(id)
		expect(response.sendStatus).toHaveBeenCalledWith(StatusCodes.NO_CONTENT)
	})

	it('updateUser should function normally when called by admin', async () => {
		// given
		let id = uuidv4()
		const mockUser = {id: id, ...user}
		const request = {
			isAuthenticated: () => true,
			user: {id: 'other', role: 'admin'},
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

	it('getUser should function normally when called by admin', async () => {
		// given
		let id: string = uuidv4()
		const mockUser = {id: id, ...user}
		const request = {
			params: {id: id},
			isAuthenticated: () => true,
			user: {id: 'other', role: 'admin'}
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
	it('getUserByEmail should function normally when called by admin', async () => {
		// given
		let id: string = uuidv4()
		const mockUser = {id: id, ...user}
		const request = {
			isAuthenticated: () => true,
			query: {email: user.email},
			user: {email: 'other', role: 'admin'}
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


});