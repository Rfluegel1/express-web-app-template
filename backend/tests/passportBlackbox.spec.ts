import {StatusCodes} from 'http-status-codes'
import axios, {AxiosError} from 'axios'

jest.setTimeout(30000)
describe('Passport resource', () => {
    it('allows test user to log in', async () => {
        // given
        const email = 'cypressdefault@gmail.com'
        const password = 'pass_good'
        try {
            await axios.get(`${process.env.BASE_URL}/api/users?email=${email}`)
        } catch (error) {
            if ((error as AxiosError)?.response?.status === StatusCodes.NOT_FOUND) {
                const createResponse = await axios.post(`${process.env.BASE_URL}/api/users`, {
                    email: email, password: password
                })
                expect(createResponse.status).toEqual(StatusCodes.CREATED)
            } else {
                throw error
            }
        }

        // when
        const data = new URLSearchParams()
        data.append('username', email)
        data.append('password', password)
        const postResponse = await axios.post(`${process.env.BASE_URL}/api/login`, data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })

        // then
        expect(postResponse.status).toEqual(StatusCodes.OK)
        let postData = postResponse.data
        expect(postData).toContain('href="/"')
    })
})
