import { v4 as uuidv4 } from 'uuid';
import { plainToClass } from 'class-transformer';
import bcrypt from 'bcrypt';

export default class User {
	id: string = uuidv4();
	email: string;
	passwordHash: string;
	isVerified: boolean | undefined;
	emailVerificationToken: string;
	emailVerification: { token: string; expiration: string };
	role: string;
	passwordResetToken: string;
	passwordReset: { token: string; expiration: string };
	emailUpdateToken: string;
	emailUpdate: { token: string; expiration: string };
	pendingEmail: string;

	constructor(
		email: string = '',
		passwordHash: string = '',
		isVerified: boolean = false,
		emailVerificationToken: string = '',
		emailVerification: { token: string; expiration: string } = { token: '', expiration: '' },
		role: string = 'user',
		passwordResetToken: string = '',
		passwordReset: { token: string; expiration: string } = { token: '', expiration: '' },
		updateEmailToken: string = '',
		emailUpdate: { token: string; expiration: string } = { token: '', expiration: '' },
		pendingEmail: string = '') {
		this.email = email;
		this.passwordHash = passwordHash;
		this.isVerified = isVerified;
		this.emailVerificationToken = emailVerificationToken;
		this.emailVerification = emailVerification;
		this.role = role;
		this.passwordResetToken = passwordResetToken;
		this.passwordReset = passwordReset;
		this.emailUpdateToken = updateEmailToken;
		this.emailUpdate = emailUpdate;
		this.pendingEmail = pendingEmail;
	}

	userMapper(queryResult: any): User {
		const intermediate = {
			id: queryResult?.id,
			email: queryResult?.email,
			passwordHash: queryResult?.passwordhash,
			isVerified: queryResult?.isverified,
			emailVerification: {
				token: queryResult?.emailverification?.token,
				expiration: queryResult?.emailverification?.expiration
			},
			role: queryResult?.role,
			emailUpdate: {
				token: queryResult?.emailupdate?.token,
				expiration: queryResult?.emailupdate?.expiration
			},
			passwordReset: {
				token: queryResult?.passwordreset?.token,
				expiration: queryResult?.passwordreset?.expiration
			},
			pendingEmail: queryResult?.pendingemail
		};
		return plainToClass(User, intermediate);
	}

	async isValidPassword(password: string) {
		return await bcrypt.compare(password, this.passwordHash);
	}

	updateDefinedFields(
		email: string | undefined,
		passwordHash: string | undefined,
		isVerified: boolean | undefined,
		emailVerification: { token: string; expiration: string } | undefined,
		role: string | undefined,
		passwordReset: { token: string; expiration: string } | undefined,
		emailUpdate: { token: string; expiration: string } | undefined,
		pendingEmail: string | undefined
	) {
		if (email !== undefined) {
			this.email = email;
		}
		if (passwordHash !== undefined) {
			this.passwordHash = passwordHash;
		}
		if (isVerified !== undefined) {
			this.isVerified = isVerified;
		}
		if (emailVerification?.token !== undefined) {
			this.emailVerification.token = emailVerification.token;
		}
		if (emailVerification?.expiration !== undefined) {
			this.emailVerification.expiration = emailVerification.expiration;
		}
		if (emailUpdate?.token !== undefined) {
			this.emailUpdate.token = emailUpdate.token;
		}
		if (emailUpdate?.expiration !== undefined) {
			this.emailUpdate.expiration = emailUpdate.expiration;
		}
		if (passwordReset?.token !== undefined) {
			this.passwordReset.token = passwordReset.token;
		}
		if (passwordReset?.expiration !== undefined) {
			this.passwordReset.expiration = passwordReset.expiration;
		}
		if (role !== undefined) {
			this.role = role;
		}
		if (pendingEmail !== undefined) {
			this.pendingEmail = pendingEmail;
		}
	}

}