import UserService from '../../src/users/userService'
import {v4 as uuidv4} from 'uuid'
import {UUID_REG_EXP} from '../../src/contants'
import User from '../../src/users/User'

// setup
jest.mock('../../src/users/userRepository', () => {
    return jest.fn().mockImplementation(() => {
        return {
            createUser: jest.fn(),
            deleteUser: jest.fn(),
            getUser: jest.fn(),
            getUsersByCreatedBy: jest.fn(),
            updateUser: jest.fn()
        }
    })
})
jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('passwordHash')
}));


describe('User service', () => {
    let user = {email: 'email', passwordHash: 'passwordHash'}
    let service: UserService = new UserService()
    it('createUser should call repository and returns User', async () => {
        const expectedUser = user
        // when
        let result: User = await service.createUser('email', 'password')
        // then
        expect(service.userRepository.createUser).toHaveBeenCalledWith(expect.objectContaining(expectedUser))
        expect(result.email).toEqual('email')
        expect(result.passwordHash).toEqual('passwordHash')
        expect(result.id).toMatch(UUID_REG_EXP)
    })
    it('getUser returns users from repository', async () => {
        //given
        const id: string = uuidv4()
        const mockUser = {id: id, ...user};

        (service.userRepository.getUser as jest.Mock).mockImplementation((sentId: string) => {
            if (sentId === id) {
                return mockUser
            }
        })
        // when
        const result: User = await service.getUser(id)
        // then
        expect(result.email).toEqual('email')
        expect(result.passwordHash).toEqual('passwordHash')
        expect(result.id).toEqual(id)
    })
    it('delete calls to repo', async () => {
        //given
        const id: string = uuidv4()
        // when
        await service.deleteUser(id)
        // then
        expect(service.userRepository.deleteUser).toHaveBeenCalledWith(id)
    })
})
