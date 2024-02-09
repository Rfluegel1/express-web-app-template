import { expect, test } from '@playwright/test';

test.describe('Password reset page', () => {
	test.skip('should call to password reset when email is submitted and link to login', async ({
		page
	}) => {
		// given
		await page.goto('/password-reset');
		let email = 'test.user@temporary.com';
		await page.fill('input[type="email"]', email);

		// Start listening for the request before clicking the submit button
		const requestPromise = page.waitForRequest('**/request-password-reset');

		// when
		await page.click('button[type="submit"]');

		// Await the request promise
		const request = await requestPromise;

		// then
		await page.waitForSelector(
			`text="If an account exists for ${email}, an email will be sent with further instructions"`
		);
		await expect(request.url()).toMatch(/\/request-password-reset$/);
		await expect(page.locator('input[type=email]')).toHaveValue('');

		// when
		await page.click('a[href="/login"]');

		// then
		await expect(page.locator('h1')).toHaveText('Login');
	});

	test.skip('should display error message when request fails', async ({ page, context }) => {
		// given
		await context.route('**/request-password-reset', (route) => {
			route.fulfill({
				status: 500
			});
		});
		await page.goto('/password-reset');
		await page.fill('input[type="email"]', 'test.user@temporary.com');

		// when
		await page.click('button[type="submit"]');

		// then
		await page.waitForSelector(`text="Something went wrong. Please try again."`);
	});
});
