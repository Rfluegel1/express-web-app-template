import {Router} from 'express'
import HealthCheckController from './healthCheckController'


const router: Router = Router()

let healthCheckController: HealthCheckController = new HealthCheckController()
router.get('/health-check', healthCheckController.healthcheck.bind(healthCheckController))

export = router