import {StatusCodes} from 'http-status-codes'
import axios from 'axios'

jest.setTimeout(30000 * 2)

describe('Health check resource', () => {
    it('should return happy if database connection is healthy and requests are being served', async () => {
        // when
        const getResponse = await axios.get(`${process.env.BASE_URL}/api/health-check`)

        // then
        expect(getResponse.status).toEqual(StatusCodes.OK)
        let getData = getResponse.data
        expect(getData.result).toEqual('success')
        expect(getData.integrations.database.result).toEqual('success')
        expect(getData.integrations.database.details).toEqual('')
    })
})
