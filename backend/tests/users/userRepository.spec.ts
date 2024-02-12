import UserRepository from '../../src/users/userRepository'
import {v4 as uuidv4} from 'uuid'
import {NotFoundException} from '../../src/exceptions/NotFoundException'
import User from '../../src/users/User'

// setup
jest.mock('typeorm', () => ({
    DataSource: jest.fn().mockImplementation(() => ({
        query: jest.fn(),
        initialize: jest.fn(),
        destroy: jest.fn()
    })),
}))
jest.mock('../../src/Logger', () => ({
    getLogger: jest.fn(() => {
        return {
            error: jest.fn()
        }
    })
}))

const repository = new UserRepository()
beforeEach(() => {
    repository.userDataSource.query = jest.fn()
    repository.userDataSource.initialize = jest.fn()
    repository.userDataSource.destroy = jest.fn()
})

describe('User repository', () => {
    it('initialize should initialize userDataSource', async () => {
        //when
        await repository.initialize()
        //then
        expect(repository.userDataSource.initialize).toHaveBeenCalled()
    })
    it('initialize should log actual error and throw db error', async () => {
        // given
        let error = new Error('DB Error');
        (repository.userDataSource.initialize as jest.Mock).mockRejectedValue(error)
        // expect
        await expect(repository.initialize()).rejects.toThrow('Error interacting with the database')
    })
    it('destroy should destroy userDataSource', async () => {
        //when
        await repository.destroy()
        //then
        expect(repository.userDataSource.destroy).toHaveBeenCalled()
    })
    it('destroy should log actual error and throws db error', async () => {
        // given
        let error = new Error('DB Error');
        (repository.userDataSource.destroy as jest.Mock).mockRejectedValue(error)
        //expect
        await expect(repository.destroy()).rejects.toThrow('Error interacting with the database')
    })
    it('getUser selects from userDataSource', async () => {
        //given
        const id = uuidv4();
        (repository.userDataSource.query as jest.Mock).mockImplementation(jest.fn((query, parameters) => {
            if (query === 'SELECT * FROM users WHERE id=$1' && parameters[0] === id) {
                return [{
                    id: id,
                    email: 'the email',
                    passwordhash: 'the passwordHash',
                    isverified: false,
                    emailverificationtoken: 'token'
                }]
            }
        }))
        // when
        const actual = await repository.getUser(id)
        // then
        expect(actual).toBeInstanceOf(User)
        expect(actual.id).toEqual(id)
        expect(actual.email).toEqual('the email')
        expect(actual.passwordHash).toEqual('the passwordHash')
        expect(actual.isVerified).toEqual(false)
        expect(actual.emailVerificationToken).toEqual('token')
    })
    it('getUser logs error and throws database exception', async () => {
        // given
        let error = new Error('DB Error');
        (repository.userDataSource.query as jest.Mock).mockRejectedValue(error)
        //expect
        await expect(repository.getUser(uuidv4())).rejects.toThrow('Error interacting with the database')
    })
    it('getUser throws not found when query result is empty', async () => {
        //given
        (repository.userDataSource.query as jest.Mock).mockImplementation(jest.fn(() => {
            return []
        }))
        // when and then
        await expect(() => repository.getUser(uuidv4())).rejects.toThrow(NotFoundException)
    })
    it('getUserByEmail selects from userDataSource', async () => {
        //given
        const id = uuidv4();
        (repository.userDataSource.query as jest.Mock).mockImplementation(jest.fn((query, parameters) => {
            if (query === 'SELECT * FROM users WHERE email=$1' && parameters[0] === 'the email') {
                return [{
                    id: id,
                    email: 'the email',
                    passwordhash: 'the passwordHash',
                    isverified: false,
                    emailverificationtoken: 'token',
                    role: 'admin'
                }]
            }
        }))
        // when
        const actual = await repository.getUserByEmail('the email')
        // then
        expect(actual).toBeInstanceOf(User)
        expect(actual.id).toEqual(id)
        expect(actual.email).toEqual('the email')
        expect(actual.passwordHash).toEqual('the passwordHash')
        expect(actual.isVerified).toEqual(false)
        expect(actual.emailVerificationToken).toEqual('token')
        expect(actual.role).toEqual('admin')
    })
    it('getUserByEmail logs error and throws database exception', async () => {
        // given
        let error = new Error('DB Error');
        (repository.userDataSource.query as jest.Mock).mockRejectedValue(error)
        //expect
        await expect(repository.getUserByEmail('the email')).rejects.toThrow('Error interacting with the database')
    })
    it('getUserByEmail throws not found when query result is empty', async () => {
        //given
        (repository.userDataSource.query as jest.Mock).mockImplementation(jest.fn(() => {
            return []
        }))
        // when and then
        await expect(() => repository.getUserByEmail(uuidv4())).rejects.toThrow(NotFoundException)
    })
    it('getUserByToken selects from userDataSource', async () => {
        //given
        const id = uuidv4();
        (repository.userDataSource.query as jest.Mock).mockImplementation(jest.fn((query, parameters) => {
            if (query === 'SELECT * FROM users WHERE emailVerificationToken=$1' && parameters[0] === 'token') {
                return [{
                    id: id,
                    email: 'the email',
                    passwordhash: 'the passwordHash',
                    isverified: false,
                    emailverificationtoken: 'token'
                }]
            }
        }))
        // when
        const actual = await repository.getUserByToken('token')
        // then
        expect(actual).toBeInstanceOf(User)
        expect(actual.id).toEqual(id)
        expect(actual.email).toEqual('the email')
        expect(actual.passwordHash).toEqual('the passwordHash')
        expect(actual.isVerified).toEqual(false)
        expect(actual.emailVerificationToken).toEqual('token')
    })
    it('getUserByToken logs error and throws database exception', async () => {
        // given
        let error = new Error('DB Error');
        (repository.userDataSource.query as jest.Mock).mockRejectedValue(error)
        //expect
        await expect(repository.getUserByToken('token')).rejects.toThrow('Error interacting with the database')
    })
    it('getUserByToken throws not found when query result is empty', async () => {
        //given
        (repository.userDataSource.query as jest.Mock).mockImplementation(jest.fn(() => {
            return []
        }))
        // when and then
        await expect(() => repository.getUserByToken(uuidv4())).rejects.toThrow(NotFoundException)
    })
    it('createUser inserts into userDataSource', async () => {
        //given
        const user = new User('the email', 'the passwordHash', false, 'token')
        // when
        await repository.createUser(user)
        // then
        expect(repository.userDataSource.query).toHaveBeenCalledWith(
            'INSERT INTO' +
            ' users (id, email, passwordHash, isVerified, emailVerificationToken) ' +
            'VALUES ($1, $2, $3, $4, $5)',
            [user.id, 'the email', 'the passwordHash', false, 'token']
        )
    })
    it('createUser logs error and throws database exception', async () => {
        //given
        let error = new Error('DB Error');
        (repository.userDataSource.query as jest.Mock).mockRejectedValue(error)
        //expect
        await expect(repository.createUser(new User())).rejects.toThrow('Error interacting with the database')
    })
    it('deleteUser deletes from userDataSource', async () => {
        //given
        const id = uuidv4()
        // when
        await repository.deleteUser(id)
        // then
        expect(repository.userDataSource.query).toHaveBeenCalledWith(
            'DELETE FROM users WHERE id=$1',
            [id]
        )
    })
    it('deleteUser logs error and throws database exception', async () => {
        // given
        let error = new Error('DB Error');
        (repository.userDataSource.query as jest.Mock).mockRejectedValue(error)
        //expect
        await expect(repository.deleteUser(uuidv4())).rejects.toThrow('Error interacting with the database')
    })
    it('updateUser updates users in userDataSource', async () => {
        //given
        repository.userDataSource.query = jest.fn()
        const mockUser = new User('email', 'passwordHash', false, 'token')
        // when
        await repository.updateUser(mockUser)
        // then
        expect(repository.userDataSource.query).toHaveBeenCalledWith(
            'UPDATE users SET email=$1, passwordHash=$2, isVerified=$3, emailVerificationToken=$4 WHERE id=$5',
            ['email', 'passwordHash', false, 'token', mockUser.id]
        )
    })
    it('updateUser logs error and throws database exception', async () => {
        // given
        let error = new Error('DB Error');
        (repository.userDataSource.query as jest.Mock).mockRejectedValue(error)
        //expect
        await expect(repository.updateUser(new User())).rejects.toThrow('Error interacting with the database')
    })
})
