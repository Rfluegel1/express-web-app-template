import HealthCheckService from '../../src/healthCheck/healthCheckService'
import {dataSource} from '../../src/dataSource'

// setup
jest.mock('../../src/Logger', () => ({
    getLogger: jest.fn(() => {
        return {
            error: jest.fn()
        }
    })
}))
describe('Health check service', () => {
    const healthCheckService: HealthCheckService = new HealthCheckService()
    it('healthcheck calls to repository, and returns happy response',
        async () => {
            // given
            dataSource.query = jest.fn().mockResolvedValue({})
            // when
            const actual: any = await healthCheckService.healthcheck()
            // then
            expect(dataSource.query).toBeCalledWith('SELECT 1')
            expect(actual.result).toEqual('success')
            expect(actual.integrations.database.result).toEqual('success')
            expect(actual.integrations.database.details).toEqual('')
        })
    it('healthcheck sets result and database to failure when there is an error thrown',
        async () => {
            // given
            dataSource.query = jest.fn().mockRejectedValue(new Error('error message'))
            // when
            const actual: any = await healthCheckService.healthcheck()
            // then
            expect(actual.result).toEqual('failure')
            expect(actual.integrations.database.result).toEqual('failure')
            expect(actual.integrations.database.details).toEqual('error message')
        })
})