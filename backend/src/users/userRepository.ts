import User from './User'
import {NotFoundException} from '../exceptions/NotFoundException'
import {dataSource} from '../postDataSource'
import {DataSource} from 'typeorm'
import {DatabaseException} from '../exceptions/DatabaseException'
import {getLogger} from '../Logger'

export default class UserRepository {
    userDataSource: DataSource = dataSource

    async initialize(): Promise<void> {
        await this.executeWithCatch(() => this.userDataSource.initialize())
    }

    async destroy(): Promise<void> {
        await this.executeWithCatch(() => this.userDataSource.destroy())
    }

    async getUser(id: string): Promise<User> {
        const result = await this.executeWithCatch(async () => {
            const queryResult = await this.userDataSource.query(
                'SELECT * FROM users WHERE id=$1', [id]
            )
            if (queryResult.length === 0) {
                return null
            }
            return new User().userMapper(queryResult[0])
        })

        if (result === null) {
            throw new NotFoundException(id)
        }
        return result
    }

    async getUserByEmail(email: string): Promise<User> {
        const result = await this.executeWithCatch(async () => {
            const queryResult = await this.userDataSource.query(
                'SELECT * FROM users WHERE email=$1', [email]
            )
            if (queryResult.length === 0) {
                return null
            }
            return new User().userMapper(queryResult[0])
        })

        if (result === null) {
            throw new NotFoundException(email)
        }
        return result
    }

    async createUser(user: User): Promise<void> {
        await this.executeWithCatch(async () => {
            await this.userDataSource.query(
                'INSERT INTO ' +
                'users (id, email, passwordHash, isVerified, emailVerificationToken) ' +
                'VALUES ($1, $2, $3, $4, $5)',
                [user.id, user.email, user.passwordHash, user.isVerified, user.emailVerificationToken]
            )
        })
    }

    async deleteUser(id: string): Promise<void> {
        await this.executeWithCatch(async () => {
            await this.userDataSource.query(
                'DELETE FROM users WHERE id=$1',
                [id]
            )
        })
    }

    async updateUser(user: User): Promise<void> {
        await this.executeWithCatch(async () => {
            await this.userDataSource.query(
                'UPDATE users SET email=$1, passwordHash=$2, isVerified=$3, emailVerificationToken=$4 WHERE id=$5',
                [user.email, user.passwordHash, user.isVerified, user.emailVerificationToken, user.id]
            )
        })
    }

    async executeWithCatch(action: () => Promise<any>): Promise<any> {
        try {
            return await action()
        } catch (error) {
            getLogger().error(error)
            throw new DatabaseException()
        }
    }
}