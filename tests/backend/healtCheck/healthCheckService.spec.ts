import HealthCheckService from '../../../src/backend/healthCheck/healthCheckService'
import axios from 'axios'
import {dataSource} from '../../../src/backend/postDataSource'
import {StatusCodes} from 'http-status-codes'

// setup
jest.mock('axios')
describe('Health check service', () => {
    const healthCheckService: HealthCheckService = new HealthCheckService()
    const mockedAxios = axios as jest.Mocked<typeof axios>
    it('healthcheck calls to post resource, repository, and returns happy response',
        async () => {
            // given
            mockedAxios.get.mockResolvedValue({
                status: StatusCodes.OK,
            })
            dataSource.query = jest.fn().mockResolvedValue({})
            // when
            const actual: any = await healthCheckService.healthcheck()
            // then
            expect(mockedAxios.get).toHaveBeenCalledWith('http://127.0.0.1:8080/api/posts')
            expect(dataSource.query).toBeCalledWith('SELECT 1')
            expect(actual.result).toEqual('success')
            expect(actual.integrations.database.result).toEqual('success')
            expect(actual.integrations.database.details).toEqual('')
            expect(actual.integrations.post_resource.result).toEqual('success')
            expect(actual.integrations.post_resource.details).toEqual('')
        })
    it('healthcheck sets result and database to failure when there is an error thrown',
        async () => {
            // given
            mockedAxios.get.mockResolvedValue({
                status: 200,
            })
            dataSource.query = jest.fn().mockRejectedValue(new Error('error message'))
            // when
            const actual: any = await healthCheckService.healthcheck()
            // then
            expect(actual.result).toEqual('failure')
            expect(actual.integrations.database.result).toEqual('failure')
            expect(actual.integrations.database.details).toEqual('error message')
        })

    it('healthcheck sets request to dropped on the floor when there is an error thrown',
        async () => {
            // given
            mockedAxios.get.mockRejectedValue(new Error('error message'))
            dataSource.query = jest.fn().mockResolvedValue({})
            // when
            const actual: any = await healthCheckService.healthcheck()
            // then
            expect(actual.result).toEqual('failure')
            expect(actual.integrations.post_resource.result).toEqual('failure')
            expect(actual.integrations.post_resource.details).toEqual('error message')
        })

    it('healthcheck sets request to dropped on the floor when status code is CREATED',
        async () => {
            // given
            mockedAxios.get.mockResolvedValue({
                status: StatusCodes.CREATED,
            })
            dataSource.query = jest.fn().mockResolvedValue({})
            // when
            const actual: any = await healthCheckService.healthcheck()
            // then
            expect(actual.result).toEqual('failure')
            expect(actual.integrations.post_resource.result).toEqual('failure')
            expect(actual.integrations.post_resource.details).toContain(`${StatusCodes.CREATED}`)
        })
})