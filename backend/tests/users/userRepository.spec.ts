import UserRepository from '../../src/users/userRepository';
import { v4 as uuidv4 } from 'uuid';
import { NotFoundException } from '../../src/exceptions/NotFoundException';
import User from '../../src/users/User';

// setup
jest.mock('typeorm', () => ({
	DataSource: jest.fn().mockImplementation(() => ({
		query: jest.fn(),
		initialize: jest.fn(),
		destroy: jest.fn()
	}))
}));
jest.mock('../../src/Logger', () => ({
	getLogger: jest.fn(() => {
		return {
			error: jest.fn()
		};
	})
}));

const repository = new UserRepository();
beforeEach(() => {
	repository.userDataSource.query = jest.fn();
	repository.userDataSource.initialize = jest.fn();
	repository.userDataSource.destroy = jest.fn();
});

describe('User repository', () => {
	it('initialize should initialize userDataSource', async () => {
		//when
		await repository.initialize();
		//then
		expect(repository.userDataSource.initialize).toHaveBeenCalled();
	});
	it('initialize should log actual error and throw db error', async () => {
		// given
		let error = new Error('DB Error');
		(repository.userDataSource.initialize as jest.Mock).mockRejectedValue(error);
		// expect
		await expect(repository.initialize()).rejects.toThrow('Error interacting with the database');
	});
	it('destroy should destroy userDataSource', async () => {
		//when
		await repository.destroy();
		//then
		expect(repository.userDataSource.destroy).toHaveBeenCalled();
	});
	it('destroy should log actual error and throws db error', async () => {
		// given
		let error = new Error('DB Error');
		(repository.userDataSource.destroy as jest.Mock).mockRejectedValue(error);
		//expect
		await expect(repository.destroy()).rejects.toThrow('Error interacting with the database');
	});
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
				}];
			}
		}));
		// when
		const actual = await repository.getUser(id);
		// then
		expect(actual).toBeInstanceOf(User);
		expect(actual.id).toEqual(id);
		expect(actual.email).toEqual('the email');
		expect(actual.passwordHash).toEqual('the passwordHash');
		expect(actual.isVerified).toEqual(false);
		expect(actual.emailVerificationToken).toEqual('token');
	});
	it('getUser logs error and throws database exception', async () => {
		// given
		let error = new Error('DB Error');
		(repository.userDataSource.query as jest.Mock).mockRejectedValue(error);
		//expect
		await expect(repository.getUser(uuidv4())).rejects.toThrow('Error interacting with the database');
	});
	it('getUser throws not found when query result is empty', async () => {
		//given
		(repository.userDataSource.query as jest.Mock).mockImplementation(jest.fn(() => {
			return [];
		}));
		// when and then
		await expect(() => repository.getUser(uuidv4())).rejects.toThrow(NotFoundException);
	});
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
				}];
			}
		}));
		// when
		const actual = await repository.getUserByEmail('the email');
		// then
		expect(actual).toBeInstanceOf(User);
		expect(actual.id).toEqual(id);
		expect(actual.email).toEqual('the email');
		expect(actual.passwordHash).toEqual('the passwordHash');
		expect(actual.isVerified).toEqual(false);
		expect(actual.emailVerificationToken).toEqual('token');
		expect(actual.role).toEqual('admin');
	});
	it('getUserByEmail logs error and throws database exception', async () => {
		// given
		let error = new Error('DB Error');
		(repository.userDataSource.query as jest.Mock).mockRejectedValue(error);
		//expect
		await expect(repository.getUserByEmail('the email')).rejects.toThrow('Error interacting with the database');
	});
	it('getUserByEmail throws not found when query result is empty', async () => {
		//given
		(repository.userDataSource.query as jest.Mock).mockImplementation(jest.fn(() => {
			return [];
		}));
		// when and then
		await expect(() => repository.getUserByEmail(uuidv4())).rejects.toThrow(NotFoundException);
	});
	it('getUserByEmailVerificationToken selects from userDataSource', async () => {
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
				}];
			}
		}));
		// when
		const actual = await repository.getUserByEmailVerificationToken('token');
		// then
		expect(actual).toBeInstanceOf(User);
		expect(actual.id).toEqual(id);
		expect(actual.email).toEqual('the email');
		expect(actual.passwordHash).toEqual('the passwordHash');
		expect(actual.isVerified).toEqual(false);
		expect(actual.emailVerificationToken).toEqual('token');
	});
	it('getUserByEmailVerificationToken logs error and throws database exception', async () => {
		// given
		let error = new Error('DB Error');
		(repository.userDataSource.query as jest.Mock).mockRejectedValue(error);
		//expect
		await expect(repository.getUserByEmailVerificationToken('token')).rejects.toThrow('Error interacting with the database');
	});
	it('getUserByEmailVerificationToken throws not found when query result is empty', async () => {
		//given
		(repository.userDataSource.query as jest.Mock).mockImplementation(jest.fn(() => {
			return [];
		}));
		// when and then
		await expect(() => repository.getUserByEmailVerificationToken(uuidv4())).rejects.toThrow(NotFoundException);
	});
	it('getUserByPasswordResetToken selects from userDataSource', async () => {
		//given
		const id = uuidv4();
		(repository.userDataSource.query as jest.Mock).mockImplementation(jest.fn((query, parameters) => {
			if (query === 'SELECT * FROM users WHERE passwordResetToken=$1' && parameters[0] === 'token') {
				return [{
					id: id,
					email: 'the email',
					passwordhash: 'the passwordHash',
					isverified: false,
					passwordresettoken: 'token',
					emailupdatetoken: 'emailUpdateToken',
					pendingemail: 'pendingEmail',
					emailverificationtoken: 'emailVerificationToken'
				}];
			}
		}));
		// when
		const actual = await repository.getUserByPasswordResetToken('token');
		// then
		expect(actual).toBeInstanceOf(User);
		expect(actual.id).toEqual(id);
		expect(actual.email).toEqual('the email');
		expect(actual.passwordHash).toEqual('the passwordHash');
		expect(actual.isVerified).toEqual(false);
		expect(actual.passwordResetToken).toEqual('token');
		expect(actual.emailUpdateToken).toEqual('emailUpdateToken');
		expect(actual.emailVerificationToken).toEqual('emailVerificationToken');
		expect(actual.pendingEmail).toEqual('pendingEmail');
	});
	it('getUserByPasswordResetToken logs error and throws database exception', async () => {
		// given
		let error = new Error('DB Error');
		(repository.userDataSource.query as jest.Mock).mockRejectedValue(error);
		//expect
		await expect(repository.getUserByPasswordResetToken('token')).rejects.toThrow('Error interacting with the database');
	});
	it('getUserByPasswordResetToken throws not found when query result is empty', async () => {
		//given
		(repository.userDataSource.query as jest.Mock).mockImplementation(jest.fn(() => {
			return [];
		}));
		// when and then
		await expect(() => repository.getUserByPasswordResetToken(uuidv4())).rejects.toThrow(NotFoundException);
	});
	it('getUserByEmailUpdateToken selects from userDataSource', async () => {
		//given
		const id = uuidv4();
		(repository.userDataSource.query as jest.Mock).mockImplementation(jest.fn((query, parameters) => {
			if (query === 'SELECT * FROM users WHERE emailUpdateToken=$1' && parameters[0] === 'token') {
				return [{
					id: id,
					email: 'the email',
					passwordhash: 'the passwordHash',
					isverified: false,
					passwordresettoken: 'token',
					emailupdatetoken: 'emailUpdateToken',
					pendingemail: 'pendingEmail',
					emailverificationtoken: 'emailVerificationToken'
				}];
			}
		}));
		// when
		const actual = await repository.getUserByEmailUpdateToken('token');
		// then
		expect(actual).toBeInstanceOf(User);
		expect(actual.id).toEqual(id);
		expect(actual.email).toEqual('the email');
		expect(actual.passwordHash).toEqual('the passwordHash');
		expect(actual.isVerified).toEqual(false);
		expect(actual.passwordResetToken).toEqual('token');
		expect(actual.emailUpdateToken).toEqual('emailUpdateToken');
		expect(actual.emailVerificationToken).toEqual('emailVerificationToken');
		expect(actual.pendingEmail).toEqual('pendingEmail');
	});
	it('getUserByEmailUpdateToken logs error and throws database exception', async () => {
		// given
		let error = new Error('DB Error');
		(repository.userDataSource.query as jest.Mock).mockRejectedValue(error);
		//expect
		await expect(repository.getUserByEmailUpdateToken('token')).rejects.toThrow('Error interacting with the database');
	});
	it('getUserByEmailUpdateToken throws not found when query result is empty', async () => {
		//given
		(repository.userDataSource.query as jest.Mock).mockImplementation(jest.fn(() => {
			return [];
		}));
		// when and then
		await expect(() => repository.getUserByEmailUpdateToken(uuidv4())).rejects.toThrow(NotFoundException);
	});
	it('createUser inserts into userDataSource', async () => {
		//given
		const user = new User('the email', 'the passwordHash', false, 'token');
		// when
		await repository.createUser(user);
		// then
		expect(repository.userDataSource.query).toHaveBeenCalledWith(
			'INSERT INTO' +
			' users (id, email, passwordHash, isVerified, emailVerificationToken) ' +
			'VALUES ($1, $2, $3, $4, $5)',
			[user.id, 'the email', 'the passwordHash', false, 'token']
		);
	});
	it('createUser logs error and throws database exception', async () => {
		//given
		let error = new Error('DB Error');
		(repository.userDataSource.query as jest.Mock).mockRejectedValue(error);
		//expect
		await expect(repository.createUser(new User())).rejects.toThrow('Error interacting with the database');
	});
	it('createUser logs error and throws duplicate row exception', async () => {
		//given
		class CustomError extends Error {
			constraint: string;

			constructor(message: string, constraint: string) {
				super(message);
				this.constraint = constraint;
				this.name = 'CustomError';
			}
		}

		let error = new CustomError('duplicate key value violates unique constraint', 'asdasd');
		(repository.userDataSource.query as jest.Mock).mockRejectedValue(error);
		//expect
		await expect(repository.createUser(new User())).rejects.toThrow('Duplicate key value violates unique constraint=asdasd');
	});
	it('deleteUser deletes from userDataSource', async () => {
		//given
		const id = uuidv4();
		// when
		await repository.deleteUser(id);
		// then
		expect(repository.userDataSource.query).toHaveBeenCalledWith(
			'DELETE FROM users WHERE id=$1',
			[id]
		);
	});
	it('deleteUser logs error and throws database exception', async () => {
		// given
		let error = new Error('DB Error');
		(repository.userDataSource.query as jest.Mock).mockRejectedValue(error);
		//expect
		await expect(repository.deleteUser(uuidv4())).rejects.toThrow('Error interacting with the database');
	});
	it('updateUser updates users in userDataSource', async () => {
		//given
		repository.userDataSource.query = jest.fn();
		const mockUser = new User('email', 'passwordHash', false, 'token', 'role', 'passwordResetToken', 'emailUpdateToken', 'pendingEmail')
		// when
		await repository.updateUser(mockUser);
		// then
		expect(repository.userDataSource.query).toHaveBeenCalledWith(
			'UPDATE users SET email=$1, passwordHash=$2, isVerified=$3, emailVerificationToken=$4, role=$5, passwordResetToken=$6, emailUpdateToken=$7, pendingEmail=$8 WHERE id=$9',
			['email', 'passwordHash', false, 'token', 'role', 'passwordResetToken', 'emailUpdateToken', 'pendingEmail', mockUser.id]
		);
	});
	it('updateUser logs error and throws database exception', async () => {
		// given
		let error = new Error('DB Error');
		(repository.userDataSource.query as jest.Mock).mockRejectedValue(error);
		//expect
		await expect(repository.updateUser(new User())).rejects.toThrow('Error interacting with the database');
	});
});
