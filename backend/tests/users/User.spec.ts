import {UUID_REG_EXP} from '../../src/contants'
import User from '../../src/users/User'
import bcrypt from 'bcrypt'

describe('User object', () => {
    it('default constructor sets default values', () => {
        // when
        const result: User = new User()
        // then
        expect(result.id).toMatch(UUID_REG_EXP)
        expect(result.email).toEqual('')
        expect(result.passwordHash).toEqual('')
    })
    it('values constructor sets values', () => {
        // when
        const result: User = new User('the email', 'the passwordHash')
        // then
        expect(result.id).toMatch(UUID_REG_EXP)
        expect(result.email).toEqual('the email')
        expect(result.passwordHash).toEqual('the passwordHash')
    })
    it('compares input password to password hash', async () => {
        // given
        const hashedPassword = await bcrypt.hash('password', 10);
        // when
        const result = await new User('', hashedPassword).isValidPassword('password')
        // then
        expect(result).toEqual(true)
    })
})
