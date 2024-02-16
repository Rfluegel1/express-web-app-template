import { generateTemporaryUserEmail } from './generateTemporaryUserEmail.js';

export async function registerTemporaryUser(
	page,
	email = generateTemporaryUserEmail(),
	password = 'password12',
	passwordConfirm = 'password12'
) {
	await page.goto('/register');
	await page.fill('input[type="email"]', email);
	await page.fill('input[id="password"]', password);
	await page.fill('input[id="passwordConfirm"]', passwordConfirm);
	await page.click('button[type="submit"]');
	return email;
}
