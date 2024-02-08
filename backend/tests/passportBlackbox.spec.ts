import {StatusCodes} from 'http-status-codes'
import axios, { AxiosError } from 'axios';
import {wrapper} from 'axios-cookiejar-support'
import {CookieJar} from 'tough-cookie'
import {logInTestUser, logOutUser} from './helpers'

const jar = new CookieJar()
const client = wrapper(axios.create({jar, withCredentials: true}))

jest.setTimeout(30000 * 2)

describe('Passport resource', () => {
    it('allows test user to log in and out', async () => {
        // when
        const beforeLoginResponse = await client.get(`${process.env.BASE_URL}/api/session-check`)

        // then
        expect(beforeLoginResponse.status).toEqual(StatusCodes.OK)
        expect(beforeLoginResponse.data.sessionActive).toEqual(false)

        // when and then
        await logInTestUser(client)

        // when
        const afterLoginResponse = await client.get(`${process.env.BASE_URL}/api/session-check`)

        // then
        expect(afterLoginResponse.status).toEqual(StatusCodes.OK)
        expect(afterLoginResponse.data.sessionActive).toEqual(true)

        // when and then
        await logOutUser(client)

        // when
        const afterLogoutResponse = await client.get(`${process.env.BASE_URL}/api/session-check`)

				// then
				expect(afterLogoutResponse.status).toEqual(StatusCodes.OK);
				expect(afterLogoutResponse.data.sessionActive).toEqual(false);
		});

		it('throws unauthorized exception when credentials are invalid', async () => {
			let logInResponse;
			const email: string = 'cypressdefault@gmail.com';
			const password: string = 'wrongPassword';

			const data = new URLSearchParams();
			data.append('username', email);
			data.append('password', password);
			try {
				logInResponse = await client.post(`${process.env.BASE_URL}/api/login`, data, {
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
				});
			} catch (error) {
				logInResponse = (error as AxiosError).response
			}
			expect(logInResponse?.status).toEqual(StatusCodes.UNAUTHORIZED)
		});
});
