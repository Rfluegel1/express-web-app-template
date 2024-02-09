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
			getUserByToken: jest.fn()
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
	});

	it('should verify email verification token', async () => {
		//given
		let token = '1234';
		const mockUser = new User('email', 'hash', false, token);
		(verificationService.userRepository.getUserByToken as jest.Mock).mockImplementation((sentId: string) => {
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
});