import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';
import axios from 'axios';
import { generateTemporaryUserEmail, logInTestUser, logOutUser } from '../helpers';
import { StatusCodes } from 'http-status-codes';
import { dataSource } from '../../src/postDataSource';

const jar = new CookieJar();
const client = wrapper(axios.create({ jar, withCredentials: true }));

describe('Verification resource', () => {

	it('claims to have successfully sent verification email', async () => {
		// given
		await logInTestUser(
			client,
			generateTemporaryUserEmail(),
			'password'
		);

		// when
		const response = await client.post(`${process.env.BASE_URL}/api/send-verification-email`);

		// then
		expect(response.status).toEqual(StatusCodes.CREATED);

		// cleanup
		await logOutUser(client);
	});

	it('updates user status when email is verified', async () => {
		if (process.env.NODE_ENV !== 'development') {
			// cannot access database from tests in non development
			expect(true);
		} else {
			let userId
			// given
			let email = generateTemporaryUserEmail()
			await logInTestUser(
				client,
				email,
				'password'
			);
			try {

				userId = (
					await client.get(`${process.env.BASE_URL}/api/users?email=${email}`)
				).data.id;
				await dataSource.initialize();
				await dataSource.query(`UPDATE users SET emailVerificationToken=$1 WHERE email=$2`, ['123', email]);

				// when
				const getBeforeVerification = await client.get(`${process.env.BASE_URL}/api/users?email=${email}`);

				// then
				expect(getBeforeVerification.status).toEqual(StatusCodes.OK);
				expect(getBeforeVerification.data.isVerified).toEqual(false);

				// when
				const response = await client.get(`${process.env.BASE_URL}/api/verify-email?token=123`);

				// then
				expect(response.status).toEqual(StatusCodes.OK);

				// when
				const getAfterVerification = await client.get(`${process.env.BASE_URL}/api/users?email=${email}`);

				// then
				expect(getAfterVerification.status).toEqual(StatusCodes.OK);
				expect(getAfterVerification.data.isVerified).toEqual(true);
			} finally {

				// cleanup
				const deleteResponse = await client.delete(`${process.env.BASE_URL}/api/users/${userId}`);
				expect(deleteResponse.status).toEqual(StatusCodes.NO_CONTENT);
				await dataSource.destroy()
			}
		}
	});
});
