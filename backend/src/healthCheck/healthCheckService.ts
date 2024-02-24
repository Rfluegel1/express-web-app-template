import {dataSource} from '../dataSource'
import {getLogger} from '../Logger'

export default class HealthCheckService {
    async healthcheck() {
        let response = {
            'result': 'success',
            'integrations': {
                'database': {
                    'result': 'success',
                    'details': ''
                },
            }
        }
        try {
            await dataSource.query('SELECT 1')
        } catch (error: any) {
            getLogger().error('Healthcheck for datasource failed!', error)
            response.result = 'failure'
            response.integrations.database.result = 'failure'
            response.integrations.database.details = error.message
        }
        return response
    }
}