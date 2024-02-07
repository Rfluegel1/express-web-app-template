
export async function logInTestUser(
    page,
    email = 'cypressdefault@gmail.com',
    password = process.env.TEST_USER_PASSWORD
) {
    await page.goto('/login');

    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);

    await page.click('button[type="submit"]');
}