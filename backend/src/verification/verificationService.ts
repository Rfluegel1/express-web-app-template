import { v4 } from 'uuid';
import { transporter } from '../nodemailerConfig';
import UserRepository from '../users/userRepository';
import { getLogger } from '../Logger';
import bcrypt from 'bcrypt';
import User from '../users/User';
import { NotFoundException } from '../exceptions/NotFoundException';

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

	async sendPasswordResetEmail(email: string) {
		const id = v4();
		let user: User;
		try {
			user = await this.userRepository.getUserByEmail(email);
		} catch (e) {
			if (e instanceof NotFoundException) {
				getLogger().error(e.message);
				return;
			}
			throw e
		}
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

	async resetPassword(token: string, password: string) {
		const user = await this.userRepository.getUserByPasswordResetToken(token);
		let passwordHash;
		if (password) {
			passwordHash = await bcrypt.hash(password, 10);
		}
		user.passwordHash = passwordHash;
		user.passwordResetToken = '';
		await this.userRepository.updateUser(user);
	}

	async sendEmailUpdateEmail(userId: string, newEmail: string) {
		const user = await this.userRepository.getUser(userId);
		const token = v4();
		user.emailUpdateToken = token;
		user.pendingEmail = newEmail;
		await this.userRepository.updateUser(user);

		const verificationUrl = `${process.env.BASE_URL}/api/update-email?token=${token}`;

		let mailOptions = {
			from: '"Express Web App Template" <noreply@expresswebapptemplate.com>',
			to: user.pendingEmail,
			subject: 'Email Update',
			text: `Please click on the following link to update your email: ${verificationUrl}`
		};

		if (!user.pendingEmail.includes('expresswebapptemplate.com')) {
			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					getLogger().error(error);
				}
				getLogger().info(`Email update message sent for email=${user.email}`);
			});
		}
	}

	async updateEmail(token: string) {
		const user = await this.userRepository.getUserByEmailUpdateToken(token);
		user.email = user.pendingEmail;
		user.isVerified = true;
		user.pendingEmail = '';
		user.emailUpdateToken = '';
		await this.userRepository.updateUser(user);
	}
}