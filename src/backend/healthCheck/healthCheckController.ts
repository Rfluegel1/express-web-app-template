import {Request, Response} from 'express'
import {StatusCodes} from 'http-status-codes'
import HealthCheckService from './healthCheckService'

export default class HealthCheckController {
    healthCheckService: HealthCheckService = new HealthCheckService()

    async healthcheck(request: Request, response: Response) {
        let healthStatus: any = await this.healthCheckService.healthcheck()

        return response.status(StatusCodes.OK).send(healthStatus)
    }
}