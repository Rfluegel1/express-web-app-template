import {v4 as uuidv4} from 'uuid'
import {plainToClass} from 'class-transformer'
import bcrypt from 'bcrypt'

export default class User {
    id: string = uuidv4()
    email: string
    passwordHash: string

    constructor(email: string = '', passwordHash: string = '') {
        this.email = email
        this.passwordHash = passwordHash
    }

    userMapper(queryResult: any): User {
        const intermediate = {
            id: queryResult?.id,
            email: queryResult?.email,
            passwordHash: queryResult?.passwordhash,
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