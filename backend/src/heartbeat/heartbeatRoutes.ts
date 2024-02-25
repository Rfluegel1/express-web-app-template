import {Router} from 'express'
import HeartbeatController from './HeartbeatController'


const router: Router = Router()

let heartbeatController: HeartbeatController = new HeartbeatController()
router.get('/heartbeat', heartbeatController.heartbeat.bind(heartbeatController))

export = router