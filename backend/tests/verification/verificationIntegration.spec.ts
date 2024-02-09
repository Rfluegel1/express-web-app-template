import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';
import axios from 'axios';
import { logInTestUser } from '../helpers';
import { v4  } from 'uuid';
import { transporter } from '../../src/nodemailerConfig';

jest.mock('uuid', () => ({
	v4: jest.fn()
}));

jest.mock('../../src/nodemailerConfig', () => ({
	transporter: {
		sendMail: jest.fn()
	}
}));

const jar = new CookieJar();
const client = wrapper(axios.create({ jar, withCredentials: true }));

beforeAll(() => {
	if (process.env.NODE_ENV !== 'development') {
		throw new Error('cannot run integration test outside of development');
	}
	(v4 as jest.Mock).mockImplementation(() => 'mocked-uuid');
	(transporter.sendMail as jest.Mock).mockImplementation((mailOptions, callback) => {
		callback(null, 'mocked-response');
	});
});

describe('Verification resource', () => {

	it('sends verification email and updates db on verification', async () => {
		// given
		await logInTestUser(
			client,
			`test${Math.floor(Math.random() * 10000)}@updated.com`,
			'password'
		);

		// when
		await client.post(`${process.env.BASE_URL}/api/send-verification-email`);

		// then
		expect(transporter.sendMail).toHaveBeenCalledWith(
			expect.objectContaining({
				text: expect.stringContaining('mocked-uuid')
			}),
			expect.any(Function)
		);
	});
});
