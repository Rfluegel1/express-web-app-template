import {StatusCodes} from 'http-status-codes'
import axios from 'axios'

const setupPostTable = require('../postTableSetup')
setupPostTable()

describe('Health check resource', () => {
    it('should return happy if database connection is healthy and requests are being served', async () => {
        // when
        const getResponse = await axios.get(`${process.env.BASE_URL}/health-check`)

        // then
        expect(getResponse.status).toEqual(StatusCodes.OK)
        let getData = getResponse.data
        expect(getData.result).toEqual('success')
        expect(getData.integrations.database.result).toEqual('success')
        expect(getData.integrations.database.details).toEqual('')
        expect(getData.integrations.post_resource.result).toEqual('success')
        expect(getData.integrations.post_resource.details).toEqual('')
    })
})
