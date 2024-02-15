import { v4 as uuidv4 } from 'uuid';
import { plainToClass } from 'class-transformer';
import bcrypt from 'bcrypt';

export default class User {
    id: string = uuidv4()
    email: string
    passwordHash: string
    isVerified: boolean | undefined
    emailVerificationToken: string
    role: string
    passwordResetToken: string

    constructor(
      email: string = '',
      passwordHash: string = '',
      isVerified: boolean = false,
      emailVerificationToken: string = '',
      role: string = 'user',
      passwordVerificationToken: string = ''
    ) {
        this.email = email
        this.passwordHash = passwordHash
        this.isVerified = isVerified
        this.emailVerificationToken = emailVerificationToken
        this.role = role
        this.passwordResetToken = passwordVerificationToken
    }

    userMapper(queryResult: any): User {
        const intermediate = {
            id: queryResult?.id,
            email: queryResult?.email,
            passwordHash: queryResult?.passwordhash,
            isVerified: queryResult?.isverified,
            emailVerificationToken: queryResult?.emailverificationtoken,
            role: queryResult?.role,
            passwordResetToken: queryResult?.passwordresettoken
        }
        return plainToClass(User, intermediate)
    }

	async isValidPassword(password: string) {
		return await bcrypt.compare(password, this.passwordHash);
	}

	updateDefinedFields(email: string | undefined, passwordHash: string | undefined, isVerified: boolean | undefined, emailVerificationToken: string | undefined, role: string | undefined) {
		if (email !== undefined) {
			this.email = email;
		}
		if (passwordHash !== undefined) {
			this.passwordHash = passwordHash;
		}
		if (isVerified !== undefined) {
			this.isVerified = isVerified;
		}
		if (emailVerificationToken !== undefined) {
			this.emailVerificationToken = emailVerificationToken;
		}
		if (role !== undefined) {
			this.role = role;
		}
	}

}