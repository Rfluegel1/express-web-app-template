import {expect, test} from '@playwright/test'
import {logInTestUser} from './helpers/logInTestUser.js'

test('valid login should redirect to todoList', async ({ page }) => {
    // when
    await logInTestUser(page);

    // then
    await expect(page.locator('h1')).toHaveText('Todo List');
});

test('invalid login displays error message', async ({ page }) => {
    // when
    await logInTestUser(page, 'invalid@invalid.invalid', 'invalid');

    // then
    await expect(
        page.locator(
            'text="Invalid email or password."'
        )
    ).toBeVisible();
});

test('logged in user should be redirected to todoList when visiting login page', async ({
                                                                                            page
                                                                                        }) => {
    // given
    await logInTestUser(page);

    // expect
    await expect(page.locator('h1')).toHaveText('Todo List');

    // when
    await page.goto('/login');

    // then
    await expect(page.locator('h1')).toHaveText('Todo List');
});