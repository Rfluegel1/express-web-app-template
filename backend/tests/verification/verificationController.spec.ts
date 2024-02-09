import VerificationController from '../../src/verification/verificationController';
import { StatusCodes } from 'http-status-codes';
import { DatabaseException } from '../../src/exceptions/DatabaseException';
import { NextFunction } from 'express';
import { UnauthorizedException } from '../../src/exceptions/UnauthorizedException';

jest.mock('../../src/verification/verificationService', () => {
	return jest.fn().mockImplementation(() => {
		return {
			sendVerificationEmail: jest.fn(),
			verifyEmail: jest.fn()
		};
	});
});

jest.mock('../../src/Logger', () => ({
	getLogger: jest.fn(() => {
		return {
			info: jest.fn()
		}
	})
}))
describe('Verification controller', () => {
	let verificationController = new VerificationController();
	it('sendVerificationEmail should respond with created when service is successful', async () => {
		// given
		const request = {
			isAuthenticated: () => true,
			user: { id: '123' }
		};
		const response = {
			status: jest.fn(function() {
				return this;
			}), send: jest.fn()
		};
		(verificationController.verificationService.sendVerificationEmail as jest.Mock).mockImplementation((sentId) => {
			if (sentId !== '123') {
				throw new Error('sentId does not match');
			}
		});

		// when
		await verificationController.sendVerificationEmail(request as any, response as any, jest.fn());

		//then
		expect(response.status).toHaveBeenCalledWith(StatusCodes.CREATED);
	});
	it('sendVerificationEmail should next any error thrown from service', async () => {
		// given
		const request = {
			isAuthenticated: () => true,
			user: { id: '123' }
		};
		const response = {};
		(verificationController.verificationService.sendVerificationEmail as jest.Mock).mockImplementation(() => {
			throw new DatabaseException();
		});
		const next: NextFunction = jest.fn();

		// when
		await verificationController.sendVerificationEmail(request as any, response as any, next);

		//then
		expect(next).toHaveBeenCalledWith(expect.any(DatabaseException));
	});
	it('sendVerificationEmail should return unauthorized when user not authenticated', async () => {
		// given
		const request = {
			isAuthenticated: () => false,
		};
		const response = {};
		(verificationController.verificationService.sendVerificationEmail as jest.Mock).mockImplementation(() => {
			throw new DatabaseException();
		});
		const next: NextFunction = jest.fn();

		// when
		await verificationController.sendVerificationEmail(request as any, response as any, next);

		//then
		expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedException));
	});
	it('verifyEmail should respond with ok when service is successful', async () => {
		// given
		const request = {
			query: { token: '123' }
		};
		const response = {
			status: jest.fn(function() {
				return this;
			}), send: jest.fn()
		};
		(verificationController.verificationService.verifyEmail as jest.Mock).mockImplementation((sentId) => {
			if (sentId !== '123') {
				throw new Error('sentId does not match');
			}
		});

		// when
		await verificationController.verifyEmail(request as any, response as any, jest.fn());

		// then
		expect(response.status).toHaveBeenCalledWith(StatusCodes.OK);
	});

	it('verifyEmail should next any error thrown from service', async () => {
		// given
		const request = {
			query: { token: '123' }
		};
		const response = {
			status: jest.fn(function() {
				return this;
			}), send: jest.fn()
		};
		(verificationController.verificationService.verifyEmail as jest.Mock).mockImplementation(() => {
			throw new DatabaseException();
		});
		const next: NextFunction = jest.fn();

		// when
		await verificationController.verifyEmail(request as any, response as any, next);

		// then
		expect(next).toHaveBeenCalledWith(expect.any(DatabaseException));
	});
});