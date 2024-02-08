import { logInTestUser } from './helpers/logInTestUser.js';
import { expect, test } from '@playwright/test';
import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import { logInTestUserWithClient, logOutUserWithClient } from './helpers/api.js';

const jar = new CookieJar();
const client = wrapper(axios.create({ jar, withCredentials: true }));

const otherJar = new CookieJar();
const otherClient = wrapper(axios.create({ jar: otherJar, withCredentials: true }));

test('should display only todo records made by user', async ({ page }) => {
	// given
	let firstTodoId;
	let secondTodoId;
	let otherTodoId;
	let userId;

	try {
		await logInTestUserWithClient(client);
		firstTodoId = (await client.post(`${process.env.BASE_URL}/api/todos`, { task: 'squash bugs' })).data.message.id;
		secondTodoId = (await client.post(`${process.env.BASE_URL}/api/todos`, { task: 'sanitize' })).data.message.id;

		const email = `test${Math.floor(Math.random() * 10000)}@example.com`;
		const password = 'password';
		userId = await logInTestUserWithClient(otherClient, email, password);
		otherTodoId = (await otherClient.post(`${process.env.BASE_URL}/api/todos`, { task: 'watch grass grow' })).data.message.id;

		// when
		await logInTestUser(page);

		// then
		await expect(page.locator('[data-testid="squash bugs"]').first()).toHaveText('squash bugs');
		await expect(page.locator('[data-testid="sanitize"]').first()).toHaveText('sanitize');
		await expect(page.locator('text="watch grass grow"')).not.toBeVisible();
	} finally {
		// cleanup
		await client.delete(`${process.env.BASE_URL}/api/todos/${firstTodoId}`);
		await client.delete(`${process.env.BASE_URL}/api/todos/${secondTodoId}`);
		await logOutUserWithClient(client);

		await otherClient.delete(`${process.env.BASE_URL}/api/todos/${otherTodoId}`);
		await otherClient.delete(`${process.env.BASE_URL}/api/users/${userId}`);
	}
});

test('should redirect when user is not logged in', async ({ page }) => {
	// given
	await page.goto('/logout');

	// when
	await page.goto('/');

	// then
	await expect(page.locator('h1')).toHaveText('Login');
});

test('should allow tasks to be created and deleted', async ({ page }) => {
	// given
	await logInTestUser(page);

	try {
		// when
		await page.fill('input[id="task"]', 'test task');
		await page.click('button[id="create"]');

		// then
		await expect(page.locator('input[id="task"]')).toHaveValue('');

		// when
		await page.reload();

		// then
		await expect(page.locator('[data-testid="test task"]').first()).toHaveText('test task');

		// when
		await page.click('button[data-testid="delete test task"]');

		// then
		await expect(page.locator('text="test task"')).not.toBeVisible();

		// when
		await page.reload();

		// then
		await expect(page.locator('text="test task"')).not.toBeVisible();
	} finally {
		// cleanup
		try {
			await logInTestUserWithClient(client);
			const todos = await client.get(`${process.env.BASE_URL}/api/todos`);
			const testTask = todos.data.message.find(todo => todo.task === 'test task');
			await client.delete(`${process.env.BASE_URL}/api/todos/${testTask.id}`);
			await logOutUserWithClient(client);
		} catch (e) {
			if (e.message !== 'Cannot read properties of undefined (reading \'id\')') {
				throw e;
			}
		}
	}
});