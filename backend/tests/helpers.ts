import {AxiosError, AxiosInstance} from 'axios'
import {StatusCodes} from 'http-status-codes'

export async function logInTestUser(client: AxiosInstance) {
    const email = 'cypressdefault@gmail.com'
    const password = 'pass_good'

    try {
        await client.get(`${process.env.BASE_URL}/api/users?email=${email}`)
    } catch (error) {
        if ((error as AxiosError)?.response?.status === StatusCodes.NOT_FOUND) {
            const createResponse = await client.post(`${process.env.BASE_URL}/api/users`, {
                email: email, password: password
            })
            expect(createResponse.status).toEqual(StatusCodes.CREATED)
        } else {
            throw error
        }
    }

    const data = new URLSearchParams()
    data.append('username', email)
    data.append('password', password)
    let logInResponse = await client.post(`${process.env.BASE_URL}/api/login`, data, {
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
    expect(logInResponse.status).toEqual(StatusCodes.OK);
    let postData = logInResponse.data;
    expect(postData).toContain('href="/"');
    return logInResponse
}

export async function logOutUser(client: AxiosInstance){
    const logOutResponse = await client.post(`${process.env.BASE_URL}/api/logout`)

    expect(logOutResponse.status).toEqual(StatusCodes.OK)
    let logoutData = logOutResponse.data
    expect(logoutData).toContain('href="/"')
    return logOutResponse
}