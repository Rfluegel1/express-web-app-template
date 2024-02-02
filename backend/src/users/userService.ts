import User from './User'
import UserRepository from './userRepository'
import bcrypt from 'bcrypt'


export default class UserService {
    userRepository = new UserRepository()

    async createUser(email: string, password: string): Promise<User> {
        const passwordHash = await bcrypt.hash(password, 10)
        const user: User = new User(email, passwordHash)
        await this.userRepository.createUser(user)
        return user
    }

    async deleteUser(id: string): Promise<void> {
        await this.userRepository.deleteUser(id)
    }

    async getUser(id: string): Promise<User> {
        return await this.userRepository.getUser(id)
    }

    async getUserByEmail(email: string): Promise<User> {
        return await this.userRepository.getUserByEmail(email)
    }
}