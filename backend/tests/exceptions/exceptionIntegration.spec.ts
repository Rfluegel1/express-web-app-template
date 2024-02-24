import axios, {AxiosError} from 'axios'
import {v4} from 'uuid'
import {StatusCodes} from 'http-status-codes'
import {dataSource} from '../../src/dataSource'
import {logInTestUser} from '../helpers'
import {CookieJar} from 'tough-cookie'
import {wrapper} from 'axios-cookiejar-support'

const jar = new CookieJar()
const client = wrapper(axios.create({jar, withCredentials: true}))

beforeAll(() => {
    if (process.env.NODE_ENV !== 'development') {
        throw new Error('cannot run integration test outside of development')
    }
})

describe('Todo resource with some mocked aspects', () => {
    it('returns db error message after repository get failure', async () => {
        try {
            // given
            await dataSource.initialize()
            let getResponse
            await dataSource.query('DROP TABLE todos')
            await logInTestUser(client)

            // when
            try {
                getResponse = await client.get(`http://127.0.0.1:8090/api/todos/${v4()}`)
            } catch (error) {
                getResponse = (error as AxiosError).response
            }

            // then
            expect(getResponse?.data.message).toEqual('Error interacting with the database')
            expect(getResponse?.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
        } finally {
            await dataSource.query('CREATE TABLE todos ( ' +
                'id UUID PRIMARY KEY, ' +
                'task VARCHAR, ' +
                'createdBy VARCHAR ' +
                ')')
            await dataSource.destroy()
        }
    })
})