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
	emailUpdateToken: string;
	pendingEmail: string;

	constructor(
		email: string = '',
		passwordHash: string = '',
		isVerified: boolean = false,
		emailVerificationToken: string = '',
		emailVerification: { token: string; expiration: string } = { token: '', expiration: '' },
		role: string = 'user',
		passwordResetToken: string = '',
		updateEmailToken: string = ''
		, pendingEmail: string = '') {
		this.email = email;
		this.passwordHash = passwordHash;
		this.isVerified = isVerified;
		this.emailVerificationToken = emailVerificationToken;
		this.emailVerification = emailVerification;
		this.role = role;
		this.passwordResetToken = passwordResetToken;
		this.emailUpdateToken = updateEmailToken;
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
			passwordResetToken: queryResult?.passwordresettoken,
			emailUpdateToken: queryResult?.emailupdatetoken,
			pendingEmail: queryResult?.pendingemail,
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
		passwordResetToken: string | undefined,
		emailUpdateToken: string | undefined,
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
		if (role !== undefined) {
			this.role = role;
		}
		if (passwordResetToken !== undefined) {
			this.passwordResetToken = passwordResetToken;
		}
		if (emailUpdateToken !== undefined) {
			this.emailUpdateToken = emailUpdateToken;
		}
		if (pendingEmail !== undefined) {
			this.pendingEmail = pendingEmail;
		}
	}

}