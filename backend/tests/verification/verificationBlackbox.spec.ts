import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';
import axios from 'axios';
import { logInTestUser, logOutUser } from '../helpers';
import { StatusCodes } from 'http-status-codes';
import { dataSource } from '../../src/postDataSource';

const jar = new CookieJar();
const client = wrapper(axios.create({ jar, withCredentials: true }));

describe('Verification resource', () => {

	it('claims to have successfully sent verification email', async () => {
		// given
		await logInTestUser(
			client,
			`test${Math.floor(Math.random() * 10000)}@temp.com`,
			'password'
		);

		// when
		const response = await client.post(`${process.env.BASE_URL}/api/send-verification-email`);

		// then
		expect(response.status).toEqual(StatusCodes.CREATED)

		// cleanup
		await logOutUser(client)
	});

	it('updates user status when email is verified', async () => {
		// given
		let email = `test${Math.floor(Math.random() * 10000)}@temp.com`;
		await logInTestUser(
			client,
			email,
			'password'
		)
		const userId: string = (
			await client.get(`${process.env.BASE_URL}/api/users?email=${email}`)
		).data.id
		await dataSource.initialize()
		await dataSource.query(`UPDATE users SET emailVerificationToken=$1 WHERE email=$2`, ['123', email])

		// when
		const getBeforeVerification = await client.get(`${process.env.BASE_URL}/api/users?email=${email}`)

		// then
		expect(getBeforeVerification.status).toEqual(StatusCodes.OK)
		expect(getBeforeVerification.data.isVerified).toEqual(false)

		// when
		const response = await client.get(`${process.env.BASE_URL}/api/verify-email?token=123`);

		// then
		expect(response.status).toEqual(StatusCodes.OK)

		// when
		const getAfterVerification = await client.get(`${process.env.BASE_URL}/api/users?email=${email}`)

		// then
		expect(getAfterVerification.status).toEqual(StatusCodes.OK)
		expect(getAfterVerification.data.isVerified).toEqual(true)

		// cleanup
		const deleteResponse = await client.delete(`${process.env.BASE_URL}/api/users/${userId}`)
		expect(deleteResponse.status).toEqual(StatusCodes.NO_CONTENT)
	})
});
