import {StatusCodes} from 'http-status-codes'
import axios from 'axios'

require('../postTableSetup')

describe('Health check resource', () => {
    it('should return happy if database connection is healthy and requests are being served', async () => {
        // when
        const getResponse = await axios.get(`http://127.0.0.1:8080/health-check`)

        // then
        expect(getResponse.status).toEqual(StatusCodes.OK)
        let getData = getResponse.data
        expect(getData.database).toEqual('connected')
        expect(getData.request).toEqual('serving')
    })
})
