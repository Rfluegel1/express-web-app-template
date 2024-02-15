import User from '../../src/users/User';
import VerificationService from '../../src/verification/verificationService';
import { v4 } from 'uuid';
import { transporter } from '../../src/nodemailerConfig';

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
		};
	});
});

jest.mock('uuid', () => ({
	v4: jest.fn()
}));

jest.mock('../../src/nodemailerConfig')
transporter.sendMail = jest.fn()

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
				return mockUser
			}
		});

		// when
		await verificationService.sendVerificationEmail(userId);

		// then
		expect(verificationService.userRepository.updateUser)
			.toHaveBeenCalledWith({ ...mockUser, emailVerificationToken: '1234' });
		expect(transporter.sendMail).toHaveBeenCalled()
		expect(transporter.sendMail).toHaveBeenCalledWith({
			from: '"Express Web App Template" <noreply@expresswebapptemplate.com>',
			to: mockUser.email,
			subject: 'Email Verification',
			text: `Please click on the following link to verify your email: ${process.env.BASE_URL}/api/verify-email?token=1234`
		}, expect.any(Function));

		// cleanup
		transporter.sendMail = jest.fn()
	});

	it('should not send email verification email if user email is from expresswebapptemplate.com', async () => {
		// given
		const userId = v4();
		const mockUser = new User('email@expresswebapptemplate.com', 'hash');
		mockUser.id = userId;
		(v4 as jest.Mock).mockImplementation(() => '1234');
		(verificationService.userRepository.getUser as jest.Mock).mockImplementation((sentId: string) => {
			if (sentId === userId) {
				return mockUser
			}
		});

		// when
		await verificationService.sendVerificationEmail(userId);

		// then
		expect(transporter.sendMail).not.toHaveBeenCalled()
	})

	it('should verify email verification token', async () => {
		//given
		let token = '1234';
		const mockUser = new User('email', 'hash', false, token);
		(verificationService.userRepository.getUserByEmailVerificationToken as jest.Mock).mockImplementation((sentId: string) => {
			if (sentId === token) {
				return mockUser
			}
		});

		// when
		await verificationService.verifyEmail(token)

		// then
		expect(verificationService.userRepository.updateUser).toHaveBeenCalledWith({
			...mockUser,
			isVerified: true,
			emailVerificationToken: ''
		})
	})

	it('should send password reset email', async () => {
		// given
		const userId = v4();
		const mockUser = new User('email', 'hash');
		mockUser.id = userId;
		(v4 as jest.Mock).mockImplementation(() => '1234');
		(verificationService.userRepository.getUser as jest.Mock).mockImplementation((sentId: string) => {
			if (sentId === userId) {
				return mockUser
			}
		});

		// when
		await verificationService.sendPasswordResetEmail(userId);

		// then
		expect(verificationService.userRepository.updateUser)
			.toHaveBeenCalledWith({ ...mockUser, passwordResetToken: '1234' });
		expect(transporter.sendMail).toHaveBeenCalled()
		expect(transporter.sendMail).toHaveBeenCalledWith({
			from: '"Express Web App Template" <noreply@expresswebapptemplate.com>',
			to: mockUser.email,
			subject: 'Password Reset',
			text: 'Please click on the following link to reset your password: '
				+ `${process.env.BASE_URL}/api/reset-password?token=1234`
		}, expect.any(Function));

		// cleanup
		transporter.sendMail = jest.fn()
	});

	it('should not send password reset email if user email is from expresswebapptemplate.com', async () => {
		// given
		const userId = v4();
		const mockUser = new User('email@expresswebapptemplate.com', 'hash');
		mockUser.id = userId;
		(v4 as jest.Mock).mockImplementation(() => '1234');
		(verificationService.userRepository.getUser as jest.Mock).mockImplementation((sentId: string) => {
			if (sentId === userId) {
				return mockUser
			}
		});

		// when
		await verificationService.sendPasswordResetEmail(userId);

		// then
		expect(transporter.sendMail).not.toHaveBeenCalled()
	})

	it('should verify password reset token', async () => {
		//given
		let token = '1234';
		const mockUser = new User('email', 'hash', true, '', 'user', token);
		(verificationService.userRepository.getUserByPasswordResetToken as jest.Mock).mockImplementation((sentId: string) => {
			if (sentId === token) {
				return mockUser
			}
		});

		// when
		await verificationService.verifyPasswordReset(token, 'new hash')

		// then
		expect(verificationService.userRepository.updateUser).toHaveBeenCalledWith({
			...mockUser,
			passwordHash: 'new hash',
			passwordResetToken: ''
		})
	})
});