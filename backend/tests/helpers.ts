import { AxiosError, AxiosInstance } from 'axios';
import {StatusCodes} from 'http-status-codes'

async function ensureTestUser(client: AxiosInstance, email: string, password: string) {
    try {
        await client.get(`${process.env.BASE_URL}/api/users?email=${email}`)
    } catch (error) {
        if ((error as AxiosError)?.response?.status === StatusCodes.NOT_FOUND) {
            const createResponse = await client.post(`${process.env.BASE_URL}/api/users`, {
                email: email, password: password, confirmPassword: password
            })
            expect(createResponse.status).toEqual(StatusCodes.CREATED)
            return createResponse.data.id
        } else {
            throw error
        }
    }
}

export async function logInTestUser(
    client: AxiosInstance,
    email: string = 'cypressdefault@gmail.com',
    password: string = process.env.TEST_USER_PASSWORD as string
) {
    const userId = await ensureTestUser(client, email, password)

    const data = new URLSearchParams()
    data.append('username', email)
    data.append('password', password)
    let logInResponse = await client.post(`${process.env.BASE_URL}/api/login`, data, {
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
    expect(logInResponse.status).toEqual(StatusCodes.OK)
    return userId
}

export async function logOutUser(client: AxiosInstance) {
    const logOutResponse = await client.post(`${process.env.BASE_URL}/api/logout`)

    expect(logOutResponse.status).toEqual(StatusCodes.OK)
    return logOutResponse
}