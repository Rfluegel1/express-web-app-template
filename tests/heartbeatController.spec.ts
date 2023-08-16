import HeartbeatController from '../src/heartbeat/heartbeatController'

describe('Heartbeat function', () => {
    let heartbeatController: HeartbeatController = new HeartbeatController()

    it('should return version number', () => {
        const request: any = {}
        const response: any = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        }

        heartbeatController.heartbeat(request, response)

        expect(response.status).toHaveBeenCalledWith(200)
        expect(response.send).toHaveBeenCalledWith({version: '1.0.0'})
    })
})
