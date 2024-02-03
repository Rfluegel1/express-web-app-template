import { StatusCodes } from 'http-status-codes';
import axios, {AxiosError} from 'axios'
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();
const client = wrapper(axios.create({ jar, withCredentials: true }));

jest.setTimeout(30000);

describe('Passport resource', () => {
    it('allows test user to log in and out', async () => {
        // given
        const email = 'cypressdefault@gmail.com';
        const password = 'pass_good';

        try {
            await client.get(`${process.env.BASE_URL}/api/users?email=${email}`);
        } catch (error) {
            if ((error as AxiosError)?.response?.status === StatusCodes.NOT_FOUND) {
                const createResponse = await client.post(`${process.env.BASE_URL}/api/users`, {
                    email: email, password: password
                });
                expect(createResponse.status).toEqual(StatusCodes.CREATED);
            } else {
                throw error;
            }
        }

        // when
        const beforeLoginResponse = await client.get(`${process.env.BASE_URL}/api/session-check`);
        expect(beforeLoginResponse.status).toEqual(StatusCodes.OK);
        expect(beforeLoginResponse.data.sessionActive).toEqual(false);

        // when
        const data = new URLSearchParams();
        data.append('username', email);
        data.append('password', password);
        const postResponse = await client.post(`${process.env.BASE_URL}/api/login`, data, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        // then
        expect(postResponse.status).toEqual(StatusCodes.OK);
        let postData = postResponse.data;
        expect(postData).toContain('href="/"');

        // when
        const afterLoginResponse = await client.get(`${process.env.BASE_URL}/api/session-check`);

        // then
        expect(afterLoginResponse.status).toEqual(StatusCodes.OK);
        expect(afterLoginResponse.data.sessionActive).toEqual(true);

        // when
        const logoutResponse = await client.post(`${process.env.BASE_URL}/api/logout`)

        // then
        expect(logoutResponse.status).toEqual(StatusCodes.OK)
        let logoutData = logoutResponse.data;
        expect(logoutData).toContain('href="/"');

        // when
        const afterLogoutResponse = await client.get(`${process.env.BASE_URL}/api/session-check`);

        // then
        expect(afterLogoutResponse.status).toEqual(StatusCodes.OK);
        expect(afterLogoutResponse.data.sessionActive).toEqual(false);

    });
});
