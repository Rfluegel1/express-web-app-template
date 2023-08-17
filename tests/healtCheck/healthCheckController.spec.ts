import HealthCheckController from '../../src/healthCheck/healthCheckController'
import {StatusCodes} from 'http-status-codes'

// setup
jest.mock('../../src/healthCheck/healthCheckService', () => {
    return jest.fn().mockImplementation(() => {
        return {
            healthcheck: jest.fn(),
        }
    })
})

describe('Healthcheck controller function', () => {
    let healthCheckController = new HealthCheckController()
    let request: any = {}
    let response: any = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
    }

    it('calls and returns response from service', async () => {
        // given
        const expected = {database: 'connected', request: 'serving'};

        (healthCheckController.healthCheckService.healthcheck as jest.Mock).mockResolvedValue(expected)

        // when
        await healthCheckController.healthcheck(request, response)

        // then
        expect(response.status).toHaveBeenCalledWith(StatusCodes.OK)
        expect(response.send).toHaveBeenCalledWith(expected)
    })
})
