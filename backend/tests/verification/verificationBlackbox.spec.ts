import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';
import axios from 'axios';
import { authenticateAsAdmin, generateTemporaryUserEmail, logInTestUser, logOutUser } from '../helpers';
import { StatusCodes } from 'http-status-codes';
import { dataSource } from '../../src/postDataSource';
import { UUID_REG_EXP } from '../../src/contants';

const jar = new CookieJar();
const client = wrapper(axios.create({ jar, withCredentials: true }));
const adminJar = new CookieJar();
const admin = wrapper(axios.create({ jar: adminJar, withCredentials: true }));

jest.setTimeout(30000 * 2);

describe('Verification resource', () => {

	it('claims to have successfully sent password reset email', async () => {
		// given
		let userId;
		let passwordResetToken;
		let passwordHash;

		await authenticateAsAdmin(admin);
		try {
			userId = await logInTestUser(
				client,
				generateTemporaryUserEmail(),
				'password'
			);

			// when
			const getBeforeResponse = await admin.get(`${process.env.BASE_URL}/api/users/${userId}`);

			// then
			expect(getBeforeResponse.status).toEqual(StatusCodes.OK);
			expect(getBeforeResponse.data.passwordResetToken).toBeNull();
			expect(getBeforeResponse.data.passwordHash).not.toBeNull();
			passwordHash = getBeforeResponse.data.passwordHash;

			// when
			const response = await client.post(`${process.env.BASE_URL}/api/send-password-reset-email`);

			// then
			expect(response.status).toEqual(StatusCodes.CREATED);

			// when
			const getResponse = await admin.get(`${process.env.BASE_URL}/api/users/${userId}`);

			// then
			expect(getResponse.status).toEqual(StatusCodes.OK);
			expect(getResponse.data.passwordResetToken).toMatch(UUID_REG_EXP);
			passwordResetToken = getResponse.data.passwordResetToken;

			// when
			const resetResponse = await client.put(`${process.env.BASE_URL}/api/reset-password?token=${passwordResetToken}`, {
				password: 'newPassword',
				confirmPassword: 'newPassword'
			});

			// then
			expect(resetResponse.status).toEqual(StatusCodes.OK);

			//when
			const getAfterVerification = await admin.get(`${process.env.BASE_URL}/api/users/${userId}`);

			// then
			expect(getAfterVerification.status).toEqual(StatusCodes.OK);
			expect(getAfterVerification.data.passwordHash).not.toBeNull();
			expect(getAfterVerification.data.passwordHash).not.toEqual(passwordHash);
			expect(getAfterVerification.data.passwordResetToken).toEqual('');
		} finally {
			// cleanup
			await logOutUser(client);
			const deleteResponse = await admin.delete(`${process.env.BASE_URL}/api/users/${userId}`);
			expect(deleteResponse.status).toEqual(StatusCodes.NO_CONTENT);
			await logOutUser(admin);
		}
	});
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
			let userId;
			// given
			let email = generateTemporaryUserEmail();
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
				await dataSource.destroy();
			}
		}
	});
});