import {StatusCodes} from 'http-status-codes'
import axios from 'axios'
import {UUID_REG_EXP} from '../../src/contants'
import {AxiosError} from 'axios'

jest.setTimeout(30000 * 2)
describe('User resource', () => {
    it('should create, get, update, and delete', async () => {
        // given
        let id
        const email = `test${Math.floor(Math.random() * 10000)}@example.com`
        const updatedEmail = `test${Math.floor(Math.random() * 10000)}@updated.com`
        const password = 'password'
        const updatedPassword = 'newPassword'

        // when
        const postResponse = await axios.post(`${process.env.BASE_URL}/api/users`, {
            email: email, password: password
        })

        // then
        expect(postResponse.status).toEqual(StatusCodes.CREATED)
        let postData = postResponse.data
        expect(postData.id).toMatch(UUID_REG_EXP)
        expect(postData.email).toEqual(email)
        expect(postData.password).toEqual(undefined)
        expect(postData.passwordHash).toEqual(undefined)

        // and
        id = postData.id

        // when
        const getResponse = await axios.get(`${process.env.BASE_URL}/api/users/${id}`)

        // then
        expect(getResponse.status).toEqual(StatusCodes.OK)
        let getData = getResponse.data
        expect(getData.id).toEqual(id)
        expect(getData.email).toEqual(email)
        expect(getData.password).toEqual(undefined)
        expect(getData.passwordHash).toEqual(undefined)

        // when
        const getByEmailResponse = await axios.get(`${process.env.BASE_URL}/api/users?email=${email}`)

        // then
        expect(getByEmailResponse.status).toEqual(StatusCodes.OK)
        let getByEmailData = getByEmailResponse.data
        expect(getByEmailData.id).toEqual(id)
        expect(getByEmailData.email).toEqual(email)
        expect(getByEmailData.password).toEqual(undefined)
        expect(getByEmailData.passwordHash).toEqual(undefined)

        // when
        const updateResponse = await axios.put(`${process.env.BASE_URL}/api/users/${id}`, {
          email: updatedEmail, password: updatedPassword
        })

        // then
        expect(updateResponse.status).toEqual(StatusCodes.OK)
        const updateData = updateResponse.data
        expect(updateData.id).toEqual(id)
        expect(updateData.email).toEqual(updatedEmail)
        expect(updateData.password).toEqual(undefined)
        expect(updateData.passwordHash).toEqual(undefined)

        // when
        const getAfterUpdateResponse = await axios.get(`${process.env.BASE_URL}/api/users/${id}`)

        // then
        expect(getAfterUpdateResponse.status).toEqual(StatusCodes.OK)
        const getAfterUpdateData = getAfterUpdateResponse.data
        expect(getAfterUpdateData.id).toEqual(id)
        expect(getAfterUpdateData.email).toEqual(updatedEmail)
        expect(getAfterUpdateData.password).toEqual(undefined)
        expect(getAfterUpdateData.passwordHash).toEqual(undefined)

        // when
        const deleteResponse = await axios.delete(`${process.env.BASE_URL}/api/users/${id}`)

        // then
        expect(deleteResponse.status).toEqual(StatusCodes.NO_CONTENT)

        // when
        let getAfterDeleteResponse

        try {
            getAfterDeleteResponse = await axios.get(`${process.env.BASE_URL}/api/users/${id}`)
        } catch (error) {
            getAfterDeleteResponse = (error as AxiosError).response
        }

        // then
        expect(getAfterDeleteResponse?.status).toEqual(StatusCodes.NOT_FOUND)
        expect(getAfterDeleteResponse?.data.message).toEqual(`Object not found for id=${id}`)
    })
})
