import {Request, Response} from 'express'
import {StatusCodes} from 'http-status-codes'
import axios from 'axios'
import {dataSource} from '../postDataSource'

export default class HealthCheckController {
    async healthcheck(request: Request, response: Response) {
        let healthStatus: any = {}
        try {
            await dataSource.query('SELECT 1')
            healthStatus['database'] = 'connected'
        } catch (error) {
            healthStatus['database'] = 'disconnected'
        }

        try {
            const postsResponse = await axios.get('http://127.0.0.1:8080/posts')

            if (postsResponse.status === StatusCodes.OK) {
                healthStatus['request'] = 'serving'
            } else {
                healthStatus['request'] = 'dropped on floor'
            }
        } catch (error) {
            healthStatus['request'] = 'dropped on floor'
        }

        return response.status(StatusCodes.OK).send(healthStatus)
    }
}