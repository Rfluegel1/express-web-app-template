import { expect, test } from '@playwright/test';
import { generateTemporaryUserEmail } from './helpers/generateTemporaryUserEmail.js';

test.describe('Email change page', () => {
	test('should route to login if not logged in', async ({ page }) => {
		// given
		await page.goto('/email-change');

		// expect
		await expect(page.locator('h1')).toHaveText('Login');
	});

	test.skip('should call to email change for logged in user', async ({ page, context }) => {
		// given
		if (process.env.IS_GITHUB) {
			await context.route('**/request-email-change', (route) => {
				route.fulfill({
					status: 204
				});
			});
		}
		const email = generateTemporaryUserEmail()
		const requestPromise = page.waitForRequest('**/request-email-change');
		await loginTestUser(page);

		// expect
		await expect(page.locator('h1')).toHaveText('Todo List');

		// when
		await page.goto('/email-change');
		await page.fill('input[type="email"]', email);
		await page.click('button[type="submit"]');

		// then
		const request = await requestPromise;
		await page.waitForSelector(`text="Request sent to ${email} with further instructions"`);
		await expect(request.url()).toMatch(/\/request-email-change$/);
		await expect(page.locator('input[type=email]')).toHaveValue('');

		// when
		await page.click('a[href="/"]');

		// then
		await expect(page.locator('h1')).toHaveText('Todo List');
	});

	test.skip('should display error message when request fails', async ({ page, context }) => {
		// given
		await context.route('**/request-email-change', (route) => {
			route.fulfill({
				status: 500
			});
		});
		await loginTestUser(page);

		// expect
		await expect(page.locator('h1')).toHaveText('Todo List');

		// when
		await page.goto('/email-change');
		await page.fill('input[type="email"]', 'test.user@temporary.com');
		await page.click('button[type="submit"]');

		// then
		await page.waitForSelector(`text="Something went wrong. Please try again."`);
	});
});