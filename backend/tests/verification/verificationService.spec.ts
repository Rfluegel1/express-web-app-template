import User from '../../src/users/User';
import VerificationService from '../../src/verification/verificationService';
import { v4 } from 'uuid';
import { transporter } from '../../src/nodemailerConfig';
import { NotFoundException } from '../../src/exceptions/NotFoundException';

jest.mock('../../src/users/userRepository', () => {
	return jest.fn().mockImplementation(() => {
		return {
			createUser: jest.fn(),
			deleteUser: jest.fn(),
			getUser: jest.fn(),
			getUserByEmail: jest.fn(),
			updateUser: jest.fn(),
			getUserByEmailVerificationToken: jest.fn(),
			getUserByPasswordResetToken: jest.fn(),
			getUserByEmailUpdateToken: jest.fn()
		};
	});
});

jest.mock('uuid', () => ({
	v4: jest.fn()
}));

jest.mock('../../src/nodemailerConfig');
transporter.sendMail = jest.fn();

jest.mock('bcrypt', () => ({
	hash: jest.fn().mockResolvedValue('passwordHash')
}));

jest.mock('../../src/Logger', () => ({
	getLogger: jest.fn().mockReturnValue({
		info: jest.fn(),
		error: jest.fn()
	})
}));

describe('Verification service', () => {
	let verificationService = new VerificationService();
	it('should send email verification email', async () => {
		// given
		const userId = v4();
		const mockUser = new User('email', 'hash');
		mockUser.id = userId;
		(v4 as jest.Mock).mockImplementation(() => '1234');
		(verificationService.userRepository.getUser as jest.Mock).mockImplementation((sentId: string) => {
			if (sentId === userId) {
				return mockUser;
			}
		});

		// when
		await verificationService.sendVerificationEmail(userId);

		// then
		expect(verificationService.userRepository.updateUser)
			.toHaveBeenCalledWith({ ...mockUser, emailVerificationToken: '1234' });
		expect(transporter.sendMail).toHaveBeenCalled();
		expect(transporter.sendMail).toHaveBeenCalledWith({
			from: '"Express Web App Template" <noreply@expresswebapptemplate.com>',
			to: mockUser.email,
			subject: 'Email Verification',
			text: `Please click on the following link to verify your email: ${process.env.BASE_URL}/api/verify-email?token=1234`
		}, expect.any(Function));

		// cleanup
		transporter.sendMail = jest.fn();
	});

	it('should not send email verification email if user email is from expresswebapptemplate.com', async () => {
		// given
		const userId = v4();
		const mockUser = new User('email@expresswebapptemplate.com', 'hash');
		mockUser.id = userId;
		(v4 as jest.Mock).mockImplementation(() => '1234');
		(verificationService.userRepository.getUser as jest.Mock).mockImplementation((sentId: string) => {
			if (sentId === userId) {
				return mockUser;
			}
		});

		// when
		await verificationService.sendVerificationEmail(userId);

		// then
		expect(transporter.sendMail).not.toHaveBeenCalled();
	});

	it('should verify email verification token', async () => {
		//given
		let token = '1234';
		const mockUser = new User('email', 'hash', false, token);
		(verificationService.userRepository.getUserByEmailVerificationToken as jest.Mock).mockImplementation((sentId: string) => {
			if (sentId === token) {
				return mockUser;
			}
		});

		// when
		await verificationService.verifyEmail(token);

		// then
		expect(verificationService.userRepository.updateUser).toHaveBeenCalledWith({
			...mockUser,
			isVerified: true,
			emailVerificationToken: ''
		});
	});

	it('should send password reset email', async () => {
		// given
		const userId = v4();
		const mockUser = new User('email', 'hash');
		mockUser.id = userId;
		(v4 as jest.Mock).mockImplementation(() => '1234');
		(verificationService.userRepository.getUserByEmail as jest.Mock).mockImplementation((email: string) => {
			if (email === 'email') {
				return mockUser;
			}
		});

		// when
		await verificationService.requestPasswordReset('email');

		// then
		expect(verificationService.userRepository.updateUser)
			.toHaveBeenCalledWith({ ...mockUser, passwordResetToken: '1234' });
		expect(transporter.sendMail).toHaveBeenCalled();
		expect(transporter.sendMail).toHaveBeenCalledWith({
			from: '"Express Web App Template" <noreply@expresswebapptemplate.com>',
			to: mockUser.email,
			subject: 'Password Reset',
			text: 'Please click on the following link to reset your password: '
				+ `${process.env.BASE_URL}/reset-password?token=1234`
		}, expect.any(Function));

		// cleanup
		transporter.sendMail = jest.fn();
	});

	it('should catch not found error for password reset email', async () => {
		// given
		const userId = v4();
		const mockUser = new User('email', 'hash');
		mockUser.id = userId;
		(v4 as jest.Mock).mockImplementation(() => '1234');
		(verificationService.userRepository.getUserByEmail as jest.Mock).mockImplementation(() => {
			throw new NotFoundException('email');
		});

		// expect
		await verificationService.requestPasswordReset('email');
	});

	it('should throw non not found error for password reset email', async () => {
			// given
			const userId = v4();
			const mockUser = new User('email', 'hash');
			mockUser.id = userId;
			(v4 as jest.Mock).mockImplementation(() => '1234');
			(verificationService.userRepository.getUserByEmail as jest.Mock).mockImplementation(() => {
				throw new Error('something');
			});

			let result;
			try {
				// when
				await verificationService.requestPasswordReset('email');
			} catch (e) {
				result = e;
			}

			// then
			expect(result).toEqual(new Error('something'));
		});

	it('should not send password reset email if user email is from expresswebapptemplate.com', async () => {
		// given
		const userId = v4();
		const mockUser = new User('email@expresswebapptemplate.com', 'hash');
		mockUser.id = userId;
		(v4 as jest.Mock).mockImplementation(() => '1234');
		(verificationService.userRepository.getUserByEmail as jest.Mock).mockImplementation((email: string) => {
			if (email === 'email') {
				return mockUser;
			}
		});

		// when
		await verificationService.requestPasswordReset('email');

		// then
		expect(transporter.sendMail).not.toHaveBeenCalled();
	});

	it('should verify password reset token', async () => {
		//given
		let token = '1234';
		const mockUser = new User('email', 'hash', true, '', 'user', token);
		(verificationService.userRepository.getUserByPasswordResetToken as jest.Mock).mockImplementation((sentId: string) => {
			if (sentId === token) {
				return mockUser;
			}
		});

		// when
		await verificationService.resetPassword(token, 'password');

		// then
		expect(verificationService.userRepository.updateUser).toHaveBeenCalledWith({
			...mockUser,
			passwordHash: 'passwordHash',
			passwordResetToken: ''
		});
	});

	it('should send email update email', async () => {
		// given
		const userId = v4();
		const mockUser = new User('email', 'hash');
		mockUser.id = userId;
		(v4 as jest.Mock).mockImplementation(() => '1234');
		(verificationService.userRepository.getUser as jest.Mock).mockImplementation((sentId: string) => {
			if (sentId === userId) {
				return mockUser;
			}
		});

		// when
		await verificationService.sendEmailUpdateEmail(userId, 'newEmail');

		// then
		expect(verificationService.userRepository.updateUser)
			.toHaveBeenCalledWith({ ...mockUser, emailUpdateToken: '1234', pendingEmail: 'newEmail' });
		expect(transporter.sendMail).toHaveBeenCalled();
		expect(transporter.sendMail).toHaveBeenCalledWith({
			from: '"Express Web App Template" <noreply@expresswebapptemplate.com>',
			to: 'newEmail',
			subject: 'Email Update',
			text: 'Please click on the following link to update your email: '
				+ `${process.env.BASE_URL}/api/update-email?token=1234`
		}, expect.any(Function));

		// cleanup
		transporter.sendMail = jest.fn();
	});

	it('should not send email update email if user pending email is from expresswebapptemplate.com', async () => {
		// given
		const userId = v4();
		const mockUser = new User();
		mockUser.id = userId;
		(v4 as jest.Mock).mockImplementation(() => '1234');
		(verificationService.userRepository.getUser as jest.Mock).mockImplementation((sentId: string) => {
			if (sentId === userId) {
				return mockUser;
			}
		});

		// when
		await verificationService.sendEmailUpdateEmail(userId, 'email@expresswebapptemplate.com');

		// then
		expect(transporter.sendMail).not.toHaveBeenCalled();
	});

	it('should verify email update token', async () => {
		//given
		let token = '1234';
		const mockUser = new User('email', 'hash', false, '', 'user', '', token, 'newEmail');
		(verificationService.userRepository.getUserByEmailUpdateToken as jest.Mock).mockImplementation((sentId: string) => {
			if (sentId === token) {
				return mockUser;
			}
		});

		// when
		await verificationService.updateEmail(token);

		// then
		expect(verificationService.userRepository.updateUser).toHaveBeenCalledWith({
			...mockUser,
			emailUpdateToken: '',
			pendingEmail: '',
			email: 'newEmail',
			isVerified: true
		});
	});
});