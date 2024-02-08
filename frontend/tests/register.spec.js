import { expect, test } from '@playwright/test';


test('should have link to login page', async ({ page }) => {
	// given
	await page.goto('/register');

	// when
	await page.click('a[href="/login"]');

	// then
	await expect(page.locator('h1')).toHaveText('Login');
});

test.skip('should display mismatched password and passwordConfirm error', async ({ page }) => {
	// when
	await registerTemporaryUser(page, undefined, 'password12', 'password123');

	// then
	await expect(page.locator('text="Password and Confirm Password do not match"')).toBeVisible();
});

test.skip('should register a new user and notify user to verify their email', async ({ page }) => {
	// given
	let email;
	const requestPromise = page.waitForRequest('**/request-verification');

	try {
		// when
		email = await registerTemporaryUser(page);
		const request = await requestPromise;

		// then
		await expect(request.url()).toMatch(/\/request-verification$/);
		await expect(
			page.locator('text="Please verify your email address, and then login "')
		).toBeVisible();

		// when
		await page.click('a[href="/login"]');

		// then
		await expect(page.locator('h1')).toHaveText('Login');

		// when
		await loginTestUser(page, email, 'password12');

		// then
		await expect(page.locator('h1')).toHaveText('Todo List');
	} finally {
		// cleanup
		await authenticateAsAdmin(pb);
		const user = await pb.collection('users').getFirstListItem(`email="${email}"`);
		await pb.collection('users').delete(user.id);
	}
});