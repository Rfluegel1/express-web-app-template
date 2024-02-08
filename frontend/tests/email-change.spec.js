import { expect, test } from '@playwright/test';

test.describe('Email change page', () => {
	test('should route to login if not logged in', async ({ page }) => {
		// given
		await page.goto('/email-change');

		// expect
		await expect(page.locator('h1')).toHaveText('Login');
	});
});