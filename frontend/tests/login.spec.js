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