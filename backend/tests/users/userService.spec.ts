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
            getUserByEmail: jest.fn(),
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
    it('getUserByEmail returns users from repository', async () => {
        //given
        const id: string = uuidv4()
        const mockUser = {id: id, ...user};

        (service.userRepository.getUserByEmail as jest.Mock).mockImplementation((email: string) => {
            if (email === user.email) {
                return mockUser
            }
        })
        // when
        const result: User = await service.getUserByEmail(user.email)
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
    it('updateUser gets from repository, calls repository to update, and returns User', async () => {
        //given
        const id: string = uuidv4()
        const expectedUser = {email: 'email', passwordHash: 'passwordHash'};
        (service.userRepository.getUser as jest.Mock).mockImplementation(jest.fn(() => {
            let user = new User()
            user.id = id
            return user
        }))
        // when
        let result: User = await service.updateUser(id, 'email', 'password')
        // then
        expect(service.userRepository.updateUser).toHaveBeenCalledWith(expect.objectContaining(expectedUser))
        expect(result.email).toEqual('email')
        expect(result.passwordHash).toEqual('passwordHash')
        expect(result.id).toEqual(id)
    })
    it.each`
    email          | password      | expected
    ${undefined}   | ${undefined}  | ${{email: 'old email', passwordHash: 'old passwordHash'}}
    ${'new email'} | ${'password'} | ${{email: 'new email', passwordHash: 'passwordHash'}}
    `('updateUser only sets defined fields on updated User',
        async ({email, password, expected}) => {
            //given
            const existingUser = new User('old email', 'old passwordHash');
            (service.userRepository.getUser as jest.Mock).mockImplementation((sentId: string) => {
                if (sentId === existingUser.id) {
                    return existingUser
                }
            })
            // when
            let result: User = await service.updateUser(existingUser.id, email, password)
            // then
            expect(service.userRepository.updateUser).toHaveBeenCalledWith(expect.objectContaining(expected))
            expect(result.email).toEqual(expected.email)
            expect(result.passwordHash).toEqual(expected.passwordHash)
            expect(result.id).toEqual(existingUser.id)
        })
})
