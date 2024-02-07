import {logInTestUser} from './helpers/logInTestUser.js'
import {expect, test} from '@playwright/test'
import axios from 'axios'
import {wrapper} from 'axios-cookiejar-support'
import {CookieJar} from 'tough-cookie'
import {logInTestUserWithClient, logOutUserWithClient} from './helpers/api.js'

const jar = new CookieJar()
const client = wrapper(axios.create({jar, withCredentials: true}))

const otherJar = new CookieJar()
const otherClient = wrapper(axios.create({jar: otherJar, withCredentials: true}))

test('should display only todo records made by user', async ({page}) => {
    // given
    let firstTodoId
    let secondTodoId
    let otherTodoId
    let userId

    try {
        await logInTestUserWithClient(client)
        firstTodoId = (await client.post(`${process.env.BASE_URL}/api/todos`, {task: 'squash bugs'})).data.message.id
        secondTodoId = (await client.post(`${process.env.BASE_URL}/api/todos`, {task: 'sanitize'})).data.message.id

        const email = `test${Math.floor(Math.random() * 10000)}@example.com`
        const password = 'password'
        userId = await logInTestUserWithClient(otherClient, email, password)
        otherTodoId = (await otherClient.post(`${process.env.BASE_URL}/api/todos`, {task: 'watch grass grow'})).data.message.id

        // when
        await logInTestUser(page)

        // then
        await expect(page.locator('[data-testid="squash bugs"]').first()).toHaveText('squash bugs')
        await expect(page.locator('[data-testid="sanitize"]').first()).toHaveText('sanitize')
        await expect(page.locator('text="watch grass grow"')).not.toBeVisible()
    } finally {
        // cleanup
        await client.delete(`${process.env.BASE_URL}/api/todos/${firstTodoId}`)
        await client.delete(`${process.env.BASE_URL}/api/todos/${secondTodoId}`)
        await logOutUserWithClient(client)

        await otherClient.delete(`${process.env.BASE_URL}/api/todos/${otherTodoId}`)
        await otherClient.delete(`${process.env.BASE_URL}/api/users/${userId}`)
    }
})