import { v4 } from 'uuid';
import { transporter } from '../nodemailerConfig';
import UserRepository from '../users/userRepository';
import { getLogger } from '../Logger';

export default class VerificationService {
	userRepository = new UserRepository();

	async sendVerificationEmail(userId: string) {
		const user = await this.userRepository.getUser(userId);
		const token = v4();
		user.emailVerificationToken = token;
		await this.userRepository.updateUser(user);

		const verificationUrl = `${process.env.BASE_URL}/api/verify-email?token=${token}`;

		let mailOptions = {
			from: '"Express Web App Template" <noreply@expresswebapptemplate.com>',
			to: user.email,
			subject: 'Email Verification',
			text: `Please click on the following link to verify your email: ${verificationUrl}`
		};

		if (!user.email.includes('expresswebapptemplate.com')) {
			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					getLogger().error(error);
				}
				getLogger().info(`Email verification message sent for email=${user.email}`);
			});
		}
	}

	async verifyEmail(token: string) {
		const user = await this.userRepository.getUserByEmailVerificationToken(token);
		user.isVerified = true;
		user.emailVerificationToken = '';
		await this.userRepository.updateUser(user);
	}

	async sendPasswordResetEmail(userId: string) {
		const id = v4();
		const user = await this.userRepository.getUser(userId);
		user.passwordResetToken = id;
		await this.userRepository.updateUser(user);

		const verificationUrl = `${process.env.BASE_URL}/api/reset-password?token=${id}`;

		let mailOptions = {
			from: '"Express Web App Template" <noreply@expresswebapptemplate.com>',
			to: user.email,
			subject: 'Password Reset',
			text: `Please click on the following link to reset your password: ${verificationUrl}`
		};
		if (!user.email.includes('expresswebapptemplate.com')) {
			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					getLogger().error(error);
				}
				getLogger().info(`Email verification message sent for email=${user.email}`);
			});
		}
	}

	async verifyPasswordReset(token: string, newHash: string) {
		const user = await this.userRepository.getUserByPasswordResetToken(token);
		user.passwordHash = newHash;
		user.passwordResetToken = '';
		await this.userRepository.updateUser(user);
	}
}