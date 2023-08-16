import axios from 'axios'
import {dataSource} from '../src/postDataSource'
import HealthCheckController from '../src/healthCheck/healthCheckController'

// Creating a mock for axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('Healthcheck function', () => {
    let healthCheckController = new HealthCheckController()
    let request: any = {}
    let response: any = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
    }

    it('should return connected if the database connection is healthy and requests are being served', async () => {
        // given
        dataSource.query = jest.fn().mockResolvedValue({})
        mockedAxios.get.mockResolvedValue({
            status: 200,
        })

        // when
        await healthCheckController.healthcheck(request, response)

        // then
        expect(response.status).toHaveBeenCalledWith(200)
        expect(response.send).toHaveBeenCalledWith({database: 'connected', request: 'serving'})
    })

    it('should return disconnected if the database connection fails', async () => {
        // given
        dataSource.query = jest.fn().mockRejectedValue(new Error())

        // when
        await healthCheckController.healthcheck(request, response)

        // then
        expect(response.status).toHaveBeenCalledWith(200)
        expect(response.send).toHaveBeenCalledWith(expect.objectContaining({database: 'disconnected'}))
    })

    it('should return dropped on floor if the requests are not being served', async () => {
        // given
        dataSource.query = jest.fn().mockResolvedValue({})
        mockedAxios.get.mockRejectedValue(new Error())

        // when
        await healthCheckController.healthcheck(request, response)

        // then
        expect(response.status).toHaveBeenCalledWith(200)
        expect(response.send).toHaveBeenCalledWith(expect.objectContaining({request: 'dropped on floor'}))
    })

    it('should return dropped on floor if the requests are coming back unexpectedly', async () => {
        // given
        dataSource.query = jest.fn().mockResolvedValue({})
        mockedAxios.get.mockResolvedValue({
            status: 400,
        })

        // when
        await healthCheckController.healthcheck(request, response)

        // then
        expect(response.status).toHaveBeenCalledWith(200)
        expect(response.send).toHaveBeenCalledWith(expect.objectContaining({request: 'dropped on floor'}))
    })
})
