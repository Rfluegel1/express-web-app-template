import { StatusCodes } from 'http-status-codes';
import axios from 'axios';
import { UUID_REG_EXP } from '../../src/contants';
import { AxiosError } from 'axios';
import { authenticateAsAdmin, generateTemporaryUserEmail, logInTestUser } from '../helpers';
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';

jest.setTimeout(30000 * 2);

let client: any;

beforeEach(() => {
	const jar = new CookieJar();
	client = wrapper(axios.create({ jar, withCredentials: true }));
});

describe('User resource', () => {
	it('should create, get, update, and delete', async () => {
		// given
		let id;
		const email = generateTemporaryUserEmail()
		const updatedEmail = generateTemporaryUserEmail()
		const password = 'password';
		const updatedPassword = 'newPassword';

		// when
		const postResponse = await axios.post(`${process.env.BASE_URL}/api/users`, {
			email: email, password: password, confirmPassword: password
		});

		// then
		expect(postResponse.status).toEqual(StatusCodes.CREATED);
		let postData = postResponse.data;
		expect(postData.id).toMatch(UUID_REG_EXP);
		expect(postData.email).toEqual(email);
		expect(postData.password).toEqual(undefined);
		expect(postData.passwordHash).toEqual(undefined);
		expect(postData.isVerified).toEqual(false);
		expect(postData.emailVerificationToken).toEqual(undefined);

		// and
		id = postData.id;

		// when
		await logInTestUser(client, email, password);
		const getResponse = await client.get(`${process.env.BASE_URL}/api/users/${id}`);

		// then
		expect(getResponse.status).toEqual(StatusCodes.OK);
		let getData = getResponse.data;
		expect(getData.id).toEqual(id);
		expect(getData.email).toEqual(email);
		expect(getData.password).toEqual(undefined);
		expect(getData.passwordHash).toEqual(undefined);
		expect(getData.isVerified).toEqual(false);
		expect(getData.emailVerificationToken).toEqual(undefined);

		// when
		const getByEmailResponse = await client.get(
			`${process.env.BASE_URL}/api/users?email=${email}`
		);

		// then
		expect(getByEmailResponse.status).toEqual(StatusCodes.OK);
		let getByEmailData = getByEmailResponse.data;
		expect(getByEmailData.id).toEqual(id);
		expect(getByEmailData.email).toEqual(email);
		expect(getByEmailData.password).toEqual(undefined);
		expect(getByEmailData.passwordHash).toEqual(undefined);
		expect(getByEmailData.isVerified).toEqual(false);
		expect(getByEmailData.emailVerificationToken).toEqual(undefined);

		// when
		const updateResponse = await client.put(
			`${process.env.BASE_URL}/api/users/${id}`,
			{
				email: updatedEmail, password: updatedPassword, confirmPassword: updatedPassword
			}
		);

		// then
		expect(updateResponse.status).toEqual(StatusCodes.OK);
		const updateData = updateResponse.data;
		expect(updateData.id).toEqual(id);
		expect(updateData.email).toEqual(updatedEmail);
		expect(updateData.password).toEqual(undefined);
		expect(updateData.passwordHash).toEqual(undefined);
		expect(updateData.isVerified).toEqual(false);
		expect(updateData.emailVerificationToken).toEqual(undefined);

		// when
		const getAfterUpdateResponse = await client.get(
			`${process.env.BASE_URL}/api/users/${id}`
		);

		// then
		expect(getAfterUpdateResponse.status).toEqual(StatusCodes.OK);
		const getAfterUpdateData = getAfterUpdateResponse.data;
		expect(getAfterUpdateData.id).toEqual(id);
		expect(getAfterUpdateData.email).toEqual(updatedEmail);
		expect(getAfterUpdateData.password).toEqual(undefined);
		expect(getAfterUpdateData.passwordHash).toEqual(undefined);
		expect(getAfterUpdateData.isVerified).toEqual(false);
		expect(getAfterUpdateData.emailVerificationToken).toEqual(undefined);

		// when
		const deleteResponse = await client.delete(`${process.env.BASE_URL}/api/users/${id}`);

		// then
		expect(deleteResponse.status).toEqual(StatusCodes.NO_CONTENT);

		// when
		let getAfterDeleteResponse;

		try {
			getAfterDeleteResponse = await client.get(`${process.env.BASE_URL}/api/users/${id}`);
		} catch (error) {
			getAfterDeleteResponse = (error as AxiosError).response;
		}

		// then
		expect(getAfterDeleteResponse?.status).toEqual(StatusCodes.NOT_FOUND);
		expect(getAfterDeleteResponse?.data.message).toEqual(`Object not found for id=${id}`);
	});

	it('should throw error when password and confirmPassword do not match', async () => {
		//given
		const email = generateTemporaryUserEmail()
		let postResponse;

		// when
		try {
			postResponse = await client.post(`${process.env.BASE_URL}/api/users`, {
				email: email, password: 'password', confirmPassword: 'other'
			});
		} catch (e) {
			postResponse = (e as AxiosError).response;
		}
		// then
		expect(postResponse?.status).toEqual(StatusCodes.BAD_REQUEST);
		expect(postResponse?.data.message).toEqual('Password and passwordConfirm do not match');
	});

	it('should throw error when email is already taken', async () => {
		const email = generateTemporaryUserEmail()
		let userId
		try {
			userId = (await client.post(`${process.env.BASE_URL}/api/users`, {
				email: email, password: 'password', confirmPassword: 'password'
			})).data.id;
			let secondResponse;
			try {
				secondResponse = await client.post(`${process.env.BASE_URL}/api/users`, {
					email: email, password: 'password', confirmPassword: 'password'
				});
			} catch (e) {
				secondResponse = (e as AxiosError).response;
			}
			expect(secondResponse?.status).toEqual(StatusCodes.CONFLICT);
			expect(secondResponse?.data.message).toEqual('Duplicate key value violates unique constraint=users_email_key');
		} finally {
			await authenticateAsAdmin(client)
			await client.delete(`${process.env.BASE_URL}/api/users/${userId}`)
		}
	});

	it('should allow admin user to delete any user', async () => {
		// given
		let userId;
		const email = generateTemporaryUserEmail()
		const password = 'password';
		await authenticateAsAdmin(client);
		const postResponse = await axios.post(`${process.env.BASE_URL}/api/users`, {
			email: email, password: password, confirmPassword: password
		});

		//expect
		expect(postResponse.status).toEqual(StatusCodes.CREATED);
		userId = postResponse.data.id;

		// when
		const deleteResponse = await client.delete(`${process.env.BASE_URL}/api/users/${userId}`);

		// then
		expect(deleteResponse.status).toEqual(StatusCodes.NO_CONTENT);
	});

	it('should allow admin to view and update all fields of any user', async () => {
		// given
		let id;
		const email = generateTemporaryUserEmail()
		const updatedEmail = generateTemporaryUserEmail()
		const password = 'password';
		const updatedPassword = 'newPassword';

		await authenticateAsAdmin(client)
		// when
		try {

		const postResponse = await axios.post(`${process.env.BASE_URL}/api/users`, {
			email: email, password: password, confirmPassword: password
		});

		// then
		expect(postResponse.status).toEqual(StatusCodes.CREATED);
		id = postResponse.data.id;

		// when
		const updateResponse = await client.put(`${process.env.BASE_URL}/api/users/${id}`, {
			email: updatedEmail, password: updatedPassword, confirmPassword: updatedPassword, isVerified: true, emailVerificationToken: 'emailVerificationToken', role: 'anything'
		})

		// then
		expect(updateResponse.status).toEqual(StatusCodes.OK);
		const updateData = updateResponse.data;
		expect(updateData.id).toEqual(id);
		expect(updateData.email).toEqual(updatedEmail);
		expect(updateData.password).toEqual(undefined);
		expect(updateData.passwordHash).not.toEqual(undefined);
		expect(updateData.isVerified).toEqual(true);
		expect(updateData.emailVerificationToken).toEqual('emailVerificationToken');
		expect(updateData.role).toEqual('anything');
		} finally {
			const deleteResponse = await client.delete(`${process.env.BASE_URL}/api/users/${id}`)
			expect(deleteResponse.status).toEqual(StatusCodes.NO_CONTENT)
		}
	});
});
