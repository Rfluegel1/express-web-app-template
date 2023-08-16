import {StatusCodes} from 'http-status-codes'
import axios from 'axios'

describe('Heartbeat resource', () => {
    it('should return version of the application', async () => {
        // when
        const getResponse = await axios.get(`http://127.0.0.1:8080/heartbeat`)

        // then
        expect(getResponse.status).toEqual(StatusCodes.OK)
        let getData = getResponse.data
        expect(getData.version).toEqual('1.0.0')
    })
})
