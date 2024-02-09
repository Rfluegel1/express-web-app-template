export async function registerTemporaryUser(
	page,
	email = undefined,
	password = 'password12',
	passwordConfirm = 'password12'
) {
	if (!email) {
		email = `test.user-${Math.random()}@temporary.dev`;
	}
	await page.goto('/register');
	await page.fill('input[type="email"]', email);
	await page.fill('input[id="password"]', password);
	await page.fill('input[id="passwordConfirm"]', passwordConfirm);
	await page.click('button[type="submit"]');
	return email;
}
