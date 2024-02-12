import {v4 as uuidv4} from 'uuid'
import {plainToClass} from 'class-transformer'
import bcrypt from 'bcrypt'

export default class User {
    id: string = uuidv4()
    email: string
    passwordHash: string
    isVerified: boolean
    emailVerificationToken: string
    role: string

    constructor(
      email: string = '',
      passwordHash: string = '',
      isVerified: boolean = false,
      emailVerificationToken: string = '',
      role: string = 'user'
    ) {
        this.email = email
        this.passwordHash = passwordHash
        this.isVerified = isVerified
        this.emailVerificationToken = emailVerificationToken
        this.role = role
    }

    userMapper(queryResult: any): User {
        const intermediate = {
            id: queryResult?.id,
            email: queryResult?.email,
            passwordHash: queryResult?.passwordhash,
            isVerified: queryResult?.isverified,
            emailVerificationToken: queryResult?.emailverificationtoken,
            role: queryResult?.role
        }
        return plainToClass(User, intermediate)
    }

    async isValidPassword(password: string) {
        return await bcrypt.compare(password, this.passwordHash)
    }

    updateDefinedFields(email: string | undefined, passwordHash: string | undefined) {
        if (email !== undefined) {
            this.email = email
        }
        if (passwordHash !== undefined) {
            this.passwordHash = passwordHash
        }
    }

}