import {dataSource} from '../postDataSource'
import axios from 'axios'
import {StatusCodes} from 'http-status-codes'
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
                'post_resource': {
                    'result': 'success',
                    'details': ''
                }
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
        try {
            const getResponse = await axios.get('http://127.0.0.1:8090/api/posts')
            if (getResponse.status !== StatusCodes.OK) {
                response.result = 'failure'
                response.integrations.post_resource.result = 'failure'
                response.integrations.post_resource.details = `GET returned status code=${getResponse.status}`
            }
        } catch (error: any) {
            getLogger().error('Healthcheck for post resource failed!', error)
            response.result = 'failure'
            response.integrations.post_resource.result = 'failure'
            response.integrations.post_resource.details = error.message
        }
        return response
    }
}