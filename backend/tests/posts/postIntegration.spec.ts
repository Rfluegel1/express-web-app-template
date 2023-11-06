import axios, {AxiosError} from 'axios'
import {v4} from 'uuid'
import {StatusCodes} from 'http-status-codes'
import {dataSource} from '../../src/postDataSource'


beforeAll(() => {
    if (process.env.NODE_ENV !== 'development') {
        throw new Error('cannot run integration test outside of development')
    }
})

describe('Post resource with some mocked aspects', () => {
    it('returns db error message after repository get failure', async () => {
        try {
            // given
            await dataSource.initialize()
            let getResponse
            await dataSource.query('DROP TABLE posts')

            // when
            try {
                getResponse = await axios.get(`http://127.0.0.1:8080/api/posts/${v4()}`)
            } catch (error) {
                getResponse = (error as AxiosError).response
            }

            // then
            expect(getResponse?.data.message).toEqual('Error interacting with the database')
            expect(getResponse?.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
        } finally {
            await dataSource.query('CREATE TABLE posts ( ' +
                'id UUID PRIMARY KEY, ' +
                'userId VARCHAR, ' +
                'title VARCHAR, ' +
                'body VARCHAR ' +
                ')')
            await dataSource.destroy()
        }
    })
})