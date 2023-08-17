import HealthCheckService from '../../src/healthCheck/healthCheckService'
import axios from 'axios'
import {dataSource} from '../../src/postDataSource'
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
            expect(mockedAxios.get).toHaveBeenCalledWith('http://127.0.0.1:8080/posts')
            expect(dataSource.query).toBeCalledWith('SELECT 1')
            expect(actual.database).toEqual('connected')
            expect(actual.request).toEqual('serving')
        })
    it('healthcheck sets database to disconnected when there is an error thrown',
        async () => {
            // given
            mockedAxios.get.mockResolvedValue({
                status: 200,
            })
            dataSource.query = jest.fn().mockRejectedValue(new Error())
            // when
            const actual: any = await healthCheckService.healthcheck()
            // then
            expect(actual.database).toEqual('disconnected')
        })

    it('healthcheck sets request to dropped on the floor when there is an error thrown',
        async () => {
            // given
            mockedAxios.get.mockRejectedValue(new Error())
            dataSource.query = jest.fn().mockResolvedValue({})
            // when
            const actual: any = await healthCheckService.healthcheck()
            // then
            expect(actual.request).toEqual('dropped on the floor')
        })

    it('healthcheck sets request to dropped on the floor when status code is not OK',
        async () => {
            // given
            mockedAxios.get.mockResolvedValue({
                status: StatusCodes.NOT_FOUND,
            })
            dataSource.query = jest.fn().mockResolvedValue({})
            // when
            const actual: any = await healthCheckService.healthcheck()
            // then
            expect(actual.request).toEqual('dropped on the floor')
        })
})