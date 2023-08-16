import {Request, Response} from 'express'
import {StatusCodes} from 'http-status-codes'

export default class HeartbeatController {
    heartbeat(request: Request, response: Response): Response<string> {
        const version: string = '1.0.0'
        return response.status(StatusCodes.OK).send({version: version})
    }
}
