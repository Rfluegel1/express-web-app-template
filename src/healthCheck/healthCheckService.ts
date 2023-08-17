import {dataSource} from '../postDataSource'
import axios from 'axios'
import {StatusCodes} from 'http-status-codes'

export default class HealthCheckService {
    async healthcheck() {
        let response = {database: 'connected', request: 'serving'}
        try {
            await dataSource.query('SELECT 1')
        } catch (error) {
            response.database = 'disconnected'
        }
        try {
            const getResponse = await axios.get('http://127.0.0.1:8080/posts')
            if (getResponse.status !== StatusCodes.OK) {
                response.request = 'dropped on the floor'
            }
        } catch (error) {
            response.request = 'dropped on the floor'
        }
        return response
    }
}